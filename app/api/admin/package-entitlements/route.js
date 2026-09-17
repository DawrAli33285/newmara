import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}



export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const packages = await prisma.digitalPackage.findMany({
      orderBy: { priceCents: 'asc' },
    })

    const keyTypes = new Map() 
    for (const pkg of packages) {
      for (const [key, value] of Object.entries(pkg.entitlements || {})) {
        if (!keyTypes.has(key)) {
          keyTypes.set(key, typeof value === 'boolean' ? 'boolean' : 'quantity')
        }
      }
    }

    const entitlements = Array.from(keyTypes.entries()).map(([key, type]) => {
      const values = {}
      for (const pkg of packages) {
        const raw = pkg.entitlements?.[key]
        values[pkg.id] = type === 'boolean' ? Boolean(raw) : Number(raw || 0)
      }
      return { id: key, name: key, type, values }
    })

    return NextResponse.json({ entitlements })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

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

    const key = name.trim()
    const packages = await prisma.digitalPackage.findMany()

    const existingKeys = new Set()
    packages.forEach((p) => Object.keys(p.entitlements || {}).forEach((k) => existingKeys.add(k)))
    if (existingKeys.has(key)) {
      return NextResponse.json({ error: `An entitlement named "${key}" already exists.` }, { status: 409 })
    }

    await Promise.all(
      packages.map((pkg) => {
        const nextValue = type === 'boolean' ? Boolean(values[pkg.id]) : Number(values[pkg.id] || 0)
        return prisma.digitalPackage.update({
          where: { id: pkg.id },
          data: { entitlements: { ...(pkg.entitlements || {}), [key]: nextValue } },
        })
      })
    )

    return NextResponse.json({ entitlement: { id: key, name: key, type, values } }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}