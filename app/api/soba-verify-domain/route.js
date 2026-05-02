export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const uuid = searchParams.get('uuid')
  
    if (!uuid) {
      return Response.json({ error: 'UUID required' }, { status: 400 })
    }
  
    try {
      const response = await fetch(`https://poc.soba.network/api/verify-domain?uuid=${uuid}`)
      const data = await response.json()
      return Response.json(data)
    } catch (error) {
      console.error('SOBA verification error:', error)
      return Response.json({ error: 'Verification failed' }, { status: 500 })
    }
  }