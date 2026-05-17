import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'No API key' }, { status: 500 })
  }

  try {
    const { moves, winner, playerColor } = await req.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const moveSummary = moves
      .slice(-20) // Last 20 moves
      .map((m: { from: { row: number; col: number }; to: { row: number; col: number }; captures: unknown[] }, i: number) =>
        `Move ${i + 1}: (${m.from.row},${m.from.col}) → (${m.to.row},${m.to.col})${m.captures.length ? ` [captures ${m.captures.length}]` : ''}`
      )
      .join('\n')

    const prompt = `You are Arman, an 8-bit AI checkers coach from nfactorial school in Kazakhstan.
Analyze this checkers game where the ${playerColor} player ${winner === playerColor ? 'WON' : 'LOST'}.

Last 20 moves:
${moveSummary}

Give a fun, encouraging analysis with Arman's personality (mix of English and a bit of Kazakh like "Жарайсың!", "Ойлан!", "Дама!").
Format your response as JSON with this structure:
{
  "summary": "1-2 sentences overall game assessment",
  "highlights": [
    { "type": "good" | "missed" | "critical", "moveNumber": number, "description": "what happened and why it matters" }
  ],
  "tip": "one practical improvement tip for next game",
  "verdict": "short punchy verdict (max 8 words)"
}

Be concise, max 3 highlights. Keep descriptions under 60 chars each.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const analysis = JSON.parse(jsonMatch[0])
    return NextResponse.json(analysis)
  } catch (err) {
    return NextResponse.json({
      summary: "Great game! Every match teaches you something new.",
      highlights: [],
      tip: "Focus on controlling the center of the board.",
      verdict: "Keep practicing!",
    })
  }
}
