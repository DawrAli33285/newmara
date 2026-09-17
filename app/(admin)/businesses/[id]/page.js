import Link from 'next/link'
import { notFound } from 'next/navigation'

const businessChanges = {
  '1': {
    id: '1',
    businessName: 'The Harbour Kitchen',
    category: 'Eat & Drink',
    location: 'Dublin Airport',
    publication: 'Take Off',
    destination: 'Dublin',
    status: 'Approved',
    changeType: 'Business description',
    submittedBy: 'Sarah Murphy',
    approvedBy: 'Mara Media Admin',
    dateSubmitted: '22 August 2026, 09:42',
    dateApproved: '22 August 2026, 11:18',
    publicationLiveDate: '01 September 2026',
    lastModifiedDate: '22 August 2026, 11:18',
    submittedComment:
      'Updated the business description to reflect the new seasonal menu.',
    adminComment:
      'Approved after checking the submitted business information.',
    currentDescription:
      'A relaxed neighbourhood kitchen serving seasonal food, local produce and carefully selected wines.',
    proposedDescription:
      'A relaxed neighbourhood kitchen serving seasonal food, local produce, carefully selected wines and an expanded weekend brunch menu.',
  },
  '2': {
    id: '2',
    businessName: 'Oak & Stone Café',
    category: 'Eat & Drink',
    location: 'Dublin',
    publication: 'The Skipper',
    destination: 'Dublin',
    status: 'Mara Review',
    changeType: 'Photo gallery',
    submittedBy: 'James Kelly',
    approvedBy: 'Not approved yet',
    dateSubmitted: '21 August 2026, 15:10',
    dateApproved: 'Not approved yet',
    publicationLiveDate: 'Not scheduled',
    lastModifiedDate: '21 August 2026, 15:10',
    submittedComment:
      'Submitted three new images for the summer gallery.',
    adminComment: 'Awaiting admin review.',
    currentDescription:
      'Independent café serving coffee, light meals and homemade pastries.',
    proposedDescription:
      'Three new gallery images have been submitted for review.',
  },
}

export default async function AdminBusinessDetailPage({ params }) {
  const { id } = await params
  const business = businessChanges[id]

  if (!business) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
      

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#668b2f]">
              Business profile review
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">
              {business.businessName}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {business.category} · {business.location}
            </p>
          </div>

          <StatusBadge status={business.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-semibold text-[#0b1830]">
                  Change details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review the proposed business profile change before it becomes
                  live.
                </p>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <DetailItem
                  label="Change type"
                  value={business.changeType}
                />

                <DetailItem
                  label="Publication"
                  value={business.publication}
                />

                <DetailItem
                  label="Destination"
                  value={business.destination}
                />

                <DetailItem
                  label="Current status"
                  value={business.status}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-semibold text-[#0b1830]">
                  Proposed change
                </h2>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                    Current information
                  </p>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                    {business.currentDescription}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#668b2f]">
                    Submitted information
                  </p>

                  <div className="rounded-xl border border-[#dfe9cf] bg-[#f6faef] p-4 text-sm leading-6 text-[#4b672c]">
                    {business.proposedDescription}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-6 py-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Submitter comment
                </p>

                <p className="text-sm leading-6 text-gray-600">
                  {business.submittedComment}
                </p>
              </div>

              <div className="border-t border-gray-100 px-6 py-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Admin comment
                </p>

                <p className="text-sm leading-6 text-gray-600">
                  {business.adminComment}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-semibold text-[#0b1830]">
                  Approval actions
                </h2>
              </div>

              <div className="flex flex-wrap gap-3 p-6">
                {business.status === 'Mara Review' && (
                  <>
                    <button
                      type="button"
                      className="rounded-lg bg-[#668b2f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#527322]"
                    >
                      Approve change
                    </button>

                    <button
                      type="button"
                      className="rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Deny change
                    </button>
                  </>
                )}

                {business.status === 'Approved' && (
                  <>
                    <button
                      type="button"
                      className="rounded-lg bg-[#0b1830] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1c3664]"
                    >
                      Schedule publication
                    </button>

                    <button
                      type="button"
                      className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Reopen review
                    </button>
                  </>
                )}

                {business.status === 'Scheduled' && (
                  <button
                    type="button"
                    className="rounded-lg bg-[#668b2f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#527322]"
                  >
                    Publish live
                  </button>
                )}

                {business.status === 'Live' && (
                  <button
                    type="button"
                    className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Expire listing
                  </button>
                )}

                {business.status === 'Denied' && (
                  <button
                    type="button"
                    className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Reopen review
                  </button>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-semibold text-[#0b1830]">
                  Approval audit trail
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Record of the business profile change lifecycle.
                </p>
              </div>

              <div className="space-y-5 p-6">
                <AuditItem
                  label="Who submitted the profile change"
                  value={business.submittedBy}
                  completed
                />

                <AuditItem
                  label="Date submitted"
                  value={business.dateSubmitted}
                  completed
                />

                <AuditItem
                  label="Who approved it"
                  value={business.approvedBy}
                  completed={business.status !== 'Mara Review'}
                />

                <AuditItem
                  label="Date approved"
                  value={business.dateApproved}
                  completed={business.status !== 'Mara Review'}
                />

                <AuditItem
                  label="Publication/live date"
                  value={business.publicationLiveDate}
                  completed={[
                    'Scheduled',
                    'Live',
                    'Expired',
                  ].includes(business.status)}
                />

                <AuditItem
                  label="Last modified date"
                  value={business.lastModifiedDate}
                  completed
                  last
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Platform rule
              </p>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Mara Media retains final publishing control. A business
                submission must be reviewed and approved before it can be
                scheduled or published live.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f7f8fa] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-[#0b1830]">
        {value}
      </p>
    </div>
  )
}

function AuditItem({ label, value, completed, last = false }) {
  return (
    <div className={`relative flex gap-3 ${!last ? 'pb-1' : ''}`}>
      <div className="relative flex flex-col items-center">
        <span
          className={`z-10 grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
            completed
              ? 'bg-[#e7f4df] text-[#668b2f]'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {completed ? '✓' : '—'}
        </span>

        {!last && (
          <span className="absolute top-6 h-full w-px bg-gray-200" />
        )}
      </div>

      <div className="min-w-0 pb-4">
        <p className="text-xs font-semibold text-gray-400">{label}</p>
        <p className="mt-1 text-sm font-semibold text-[#0b1830]">
          {value}
        </p>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
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
        styles[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  )
}