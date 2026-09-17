import { notFound } from 'next/navigation'
import BusinessChangesTable from '@/components/BusinessChangesTable'

const validCategories = [
  'eat-drink',
  'accommodation',
  'taxi-transport',
  'things-to-do',
  'shopping',
  'beauty',
  'golf',
  'visitor-services',
  'professional-services',
]

export default async function BusinessChangesCategoryPage({ params }) {
  const { category } = await params

  if (!validCategories.includes(category)) {
    notFound()
  }

  return <BusinessChangesTable category={category} />
}