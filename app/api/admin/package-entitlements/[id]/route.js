import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const oldKey = decodeURIComponent(params.id)
    const body = await req.json()
    const { name, type, values } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'name is required.' }, { status: 400 })
    }
    if (!['boolean', 'quantity'].includes(type)) {
      return NextResponse.json({ error: 'type must be "boolean" or "quantity".' }, { status: 400 })
    }
    if (!isPlainObject(values)) {
      return NextResponse.json({ error: 'values must be an object keyed by package id.' }, { status: 400 })
    }

    const newKey = name.trim()
    const packages = await prisma.digitalPackage.findMany()

    
    if (newKey !== oldKey) {
      const existingKeys = new Set()
      packages.forEach((p) => Object.keys(p.entitlements || {}).forEach((k) => existingKeys.add(k)))
      if (existingKeys.has(newKey)) {
        return NextResponse.json({ error: `An entitlement named "${newKey}" already exists.` }, { status: 409 })
      }
    }

    await Promise.all(
      packages.map((pkg) => {
        const current = { ...(pkg.entitlements || {}) }
        delete current[oldKey]
        current[newKey] = type === 'boolean' ? Boolean(values[pkg.id]) : Number(values[pkg.id] || 0)
        return prisma.digitalPackage.update({
          where: { id: pkg.id },
          data: { entitlements: current },
        })
      })
    )

    return NextResponse.json({ entitlement: { id: newKey, name: newKey, type, values } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}