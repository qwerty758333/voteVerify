import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { id: 'asc' }
    })

    return NextResponse.json(candidates)
  } catch (err) {
    console.error('GET candidates error:', err)
    return NextResponse.json([])
  }
}

export async function POST(request) {
  try {
    const { candidates } = await request.json()

    console.log('Creating candidates:', candidates.length)

    await prisma.candidate.deleteMany()

    const created = await prisma.candidate.createMany({
      data: candidates.map((c) => ({
        name: c.name || c,
        votes: 0
      }))
    })

    console.log('Candidates created:', created.count)

    return NextResponse.json({
      success: true,
      count: created.count
    })
  } catch (err) {
    console.error('POST candidates error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
