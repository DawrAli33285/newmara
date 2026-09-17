
import { PDFDocument } from 'pdf-lib'


export async function mergePdfPage({ baseBuffer, newPageBuffer, insertIndex }) {
  const baseDoc = await PDFDocument.load(baseBuffer)
  const newDoc = await PDFDocument.load(newPageBuffer)

  const newPageIndices = newDoc.getPageIndices()
  const copiedPages = await baseDoc.copyPages(newDoc, newPageIndices)

  const clampedIndex = Math.max(0, Math.min(insertIndex, baseDoc.getPageCount()))

  copiedPages.forEach((page, i) => {
    baseDoc.insertPage(clampedIndex + i, page)
  })

  const mergedBytes = await baseDoc.save()

  return {
    buffer: Buffer.from(mergedBytes),
    totalPages: baseDoc.getPageCount(),
  }
}