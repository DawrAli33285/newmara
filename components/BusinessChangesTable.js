'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

const categoryNames = {
  'eat-drink': 'Eat & Drink',
  accommodation: 'Accommodation',
  'taxi-transport': 'Taxi & Transport',
  'things-to-do': 'Things To Do',
  shopping: 'Shopping',
  beauty: 'Beauty',
  golf: 'Golf',
  'visitor-services': 'Visitor Services',
  'professional-services': 'Professional Services',
}

const statusFilters = [
  'All',
  'Draft',
  'Submitted',
  'Mara Review',
  'Approved',
  'Denied',
  'Scheduled',
  'Live',
  'Expired',
]

const initialChanges = {
  'eat-drink': [
    {
      id: 1,
      business: 'The Harbour Kitchen',
      changeType: 'Business description',
      submittedBy: 'Sarah Murphy',
      submittedAt: '22 Aug 2026, 09:42',
      status: 'Mara Review',
    },
    {
      id: 2,
      business: 'Oak & Stone Café',
      changeType: 'Photo gallery',
      submittedBy: 'James Kelly',
      submittedAt: '21 Aug 2026, 15:10',
      status: 'Mara Review',
    },
    {
      id: 3,
      business: 'The Green Spoon',
      changeType: 'Telephone number',
      submittedBy: 'Niamh Byrne',
      submittedAt: '20 Aug 2026, 11:35',
      status: 'Approved',
    },
    {
      id: 4,
      business: 'Airport View Bar',
      changeType: 'Promotional offer',
      submittedBy: 'Mark Doyle',
      submittedAt: '18 Aug 2026, 14:20',
      status: 'Denied',
    },
  ],

  accommodation: [
    {
      id: 5,
      business: 'Mara Airport Hotel',
      changeType: 'Room photos',
      submittedBy: 'Aisling Ryan',
      submittedAt: '22 Aug 2026, 10:05',
      status: 'Mara Review',
    },
    {
      id: 6,
      business: 'The Old Mill Lodge',
      changeType: 'Website URL',
      submittedBy: 'Peter Walsh',
      submittedAt: '19 Aug 2026, 13:48',
      status: 'Approved',
    },
    {
      id: 7,
      business: 'The Coast Apartments',
      changeType: 'Business address',
      submittedBy: 'Laura Quinn',
      submittedAt: '16 Aug 2026, 16:22',
      status: 'Denied',
    },
  ],

  'taxi-transport': [
    {
      id: 8,
      business: 'Mara Executive Cars',
      changeType: 'Service area',
      submittedBy: 'Tom O’Brien',
      submittedAt: '22 Aug 2026, 08:50',
      status: 'Mara Review',
    },
    {
      id: 9,
      business: 'Greenline Taxis',
      changeType: 'Contact details',
      submittedBy: 'David Flynn',
      submittedAt: '17 Aug 2026, 12:03',
      status: 'Approved',
    },
  ],

  'things-to-do': [
    {
      id: 10,
      business: 'West Coast Adventures',
      changeType: 'Promotional video',
      submittedBy: 'Emma Nolan',
      submittedAt: '22 Aug 2026, 12:27',
      status: 'Mara Review',
    },
    {
      id: 11,
      business: 'Mara Heritage Tours',
      changeType: 'Business description',
      submittedBy: 'John Casey',
      submittedAt: '21 Aug 2026, 09:15',
      status: 'Mara Review',
    },
    {
      id: 12,
      business: 'Atlantic Kayaking',
      changeType: 'Current offer',
      submittedBy: 'Rachel Burke',
      submittedAt: '20 Aug 2026, 17:40',
      status: 'Mara Review',
    },
    {
      id: 13,
      business: 'Cliffs Experience',
      changeType: 'Gallery images',
      submittedBy: 'Conor Hayes',
      submittedAt: '14 Aug 2026, 10:31',
      status: 'Approved',
    },
    {
      id: 14,
      business: 'City Cycle Hire',
      changeType: 'Map location',
      submittedBy: 'Aoife McGrath',
      submittedAt: '12 Aug 2026, 14:12',
      status: 'Denied',
    },
  ],

  shopping: [
    {
      id: 15,
      business: 'Mara Market Hall',
      changeType: 'Opening hours',
      submittedBy: 'Fiona Ryan',
      submittedAt: '15 Aug 2026, 11:20',
      status: 'Approved',
    },
    {
      id: 16,
      business: 'The Craft House',
      changeType: 'Social media links',
      submittedBy: 'Liam O’Connor',
      submittedAt: '11 Aug 2026, 09:33',
      status: 'Approved',
    },
  ],

  beauty: [
    {
      id: 17,
      business: 'The Retreat Spa',
      changeType: 'Member-only offer',
      submittedBy: 'Claire Martin',
      submittedAt: '22 Aug 2026, 13:05',
      status: 'Mara Review',
    },
  ],

  golf: [
    {
      id: 18,
      business: 'Mara Links Golf Club',
      changeType: 'Website URL',
      submittedBy: 'Brian Nolan',
      submittedAt: '10 Aug 2026, 15:42',
      status: 'Approved',
    },
    {
      id: 19,
      business: 'Atlantic Golf Resort',
      changeType: 'Photo gallery',
      submittedBy: 'Karen Doyle',
      submittedAt: '08 Aug 2026, 10:18',
      status: 'Approved',
    },
  ],

  'visitor-services': [
    {
      id: 20,
      business: 'Mara Visitor Centre',
      changeType: 'Telephone number',
      submittedBy: 'Helen Burke',
      submittedAt: '22 Aug 2026, 08:12',
      status: 'Mara Review',
    },
    {
      id: 21,
      business: 'West Coast Information',
      changeType: 'Destination listing',
      submittedBy: 'Patrick Kelly',
      submittedAt: '19 Aug 2026, 16:45',
      status: 'Mara Review',
    },
    {
      id: 22,
      business: 'Airport Welcome Desk',
      changeType: 'Business logo',
      submittedBy: 'Rachel Moore',
      submittedAt: '05 Aug 2026, 12:11',
      status: 'Approved',
    },
  ],

  'professional-services': [
    {
      id: 23,
      business: 'Mara Legal Services',
      changeType: 'Contact email',
      submittedBy: 'Michael Ryan',
      submittedAt: '22 Aug 2026, 09:05',
      status: 'Mara Review',
    },
    {
      id: 24,
      business: 'West Coast Accountants',
      changeType: 'Business description',
      submittedBy: 'Susan Kelly',
      submittedAt: '06 Aug 2026, 13:22',
      status: 'Approved',
    },
  ],
}

export default function BusinessChangesTable({ category }) {
  const categoryName = categoryNames[category] || 'Business category'

  const [changes, setChanges] = useState(
    initialChanges[category] || []
  )

  const [filter, setFilter] = useState('All')

  const filteredChanges = useMemo(() => {
    if (filter === 'All') {
      return changes
    }

    return changes.filter((item) => item.status === filter)
  }, [changes, filter])

  function updateStatus(id, newStatus) {
    setChanges((currentChanges) =>
      currentChanges.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/business-changes"
          className="mb-6 inline-flex text-sm font-semibold text-[#668b2f] hover:text-[#45631f]"
        >
          ← All categories
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#668b2f]">
              Business change workflow
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">
              {categoryName}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Review, approve, schedule and publish business changes.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-xs text-gray-500">Current queue</p>

            <p className="mt-1 text-xl font-bold text-[#0b1830]">
              {
                changes.filter(
                  (item) => item.status === 'Mara Review'
                ).length
              }
            </p>

            <p className="text-xs text-[#9a6a00]">Mara Review</p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                filter === status
                  ? 'bg-[#0b1830] text-white'
                  : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 md:px-6">
            <div>
              <h2 className="font-semibold text-[#0b1830]">
                Submitted business changes
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredChanges.length}{' '}
                {filteredChanges.length === 1 ? 'change' : 'changes'} shown
              </p>
            </div>

            <span className="hidden rounded-full bg-[#edf5df] px-3 py-1 text-xs font-semibold text-[#668b2f] sm:inline-flex">
              Mara retains final publishing control
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead className="bg-[#fafbfc] text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Business</th>
                  <th className="px-6 py-4 font-semibold">Change type</th>
                  <th className="px-6 py-4 font-semibold">Submitted by</th>
                  <th className="px-6 py-4 font-semibold">
                    Date submitted
                  </th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredChanges.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-5">
                      <p className="font-semibold text-[#0b1830]">
                        {item.business}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Business profile update
                      </p>
                    </td>

                    <td className="px-6 py-5 text-gray-600">
                      {item.changeType}
                    </td>

                    <td className="px-6 py-5 text-gray-600">
                      {item.submittedBy}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 text-gray-500">
                      {item.submittedAt}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/businesses/${item.id}`}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#0b1830] hover:bg-gray-50"
                        >
                          View
                        </Link>

                        <ActionButtons
                          status={item.status}
                          onStatusChange={(newStatus) =>
                            updateStatus(item.id, newStatus)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredChanges.length === 0 && (
              <div className="px-6 py-16 text-center">
                <p className="font-semibold text-[#0b1830]">
                  No changes found
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  No changes currently match this status.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function ActionButtons({ status, onStatusChange }) {
  if (status === 'Mara Review') {
    return (
      <>
        <button
          type="button"
          onClick={() => onStatusChange('Approved')}
          className="rounded-lg bg-[#668b2f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#527322]"
        >
          Approve
        </button>

        <button
          type="button"
          onClick={() => onStatusChange('Denied')}
          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          Deny
        </button>
      </>
    )
  }

  if (status === 'Approved') {
    return (
      <button
        type="button"
        onClick={() => onStatusChange('Scheduled')}
        className="rounded-lg bg-[#0b1830] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1c3664]"
      >
        Schedule
      </button>
    )
  }

  if (status === 'Scheduled') {
    return (
      <button
        type="button"
        onClick={() => onStatusChange('Live')}
        className="rounded-lg bg-[#668b2f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#527322]"
      >
        Publish
      </button>
    )
  }

  if (status === 'Live') {
    return (
      <button
        type="button"
        onClick={() => onStatusChange('Expired')}
        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
      >
        Expire
      </button>
    )
  }

  if (status === 'Denied' || status === 'Expired') {
    return (
      <button
        type="button"
        onClick={() => onStatusChange('Mara Review')}
        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
      >
        Reopen
      </button>
    )
  }

  return (
    <span className="px-2 py-2 text-xs text-gray-400">
      No action
    </span>
  )
}

function StatusBadge({ status }) {
  const statusStyles = {
    Draft: 'bg-gray-100 text-gray-600',
    Submitted: 'bg-blue-100 text-blue-700',
    'Mara Review': 'bg-[#fff4d6] text-[#9a6a00]',
    Approved: 'bg-[#e7f4df] text-[#4b7a28]',
    Denied: 'bg-[#fde8e8] text-[#b42318]',
    Scheduled: 'bg-purple-100 text-purple-700',
    Live: 'bg-green-100 text-green-700',
    Expired: 'bg-gray-200 text-gray-600',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  )
}