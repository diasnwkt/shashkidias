import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const KEYWORDS = ['claude', 'anthropic', 'openai', 'nvidia', 'ycombinator', 'yc', 'ai', 'llm', 'startup', 'gemini', 'gpt', 'neural']

interface HNStory {
  id: number
  title: string
  url?: string
  score: number
  by: string
}

async function fetchTopHNStories(): Promise<HNStory[]> {
  const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
    next: { revalidate: 300 },
  })
  const ids: number[] = await res.json()
  const top50 = ids.slice(0, 80)

  const stories = await Promise.allSettled(
    top50.map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
    )
  )

  return stories
    .filter((s): s is PromiseFulfilledResult<HNStory> => s.status === 'fulfilled' && s.value?.title)
    .map(s => s.value)
    .filter(s => KEYWORDS.some(kw => s.title.toLowerCase().includes(kw)))
    .slice(0, 8)
}

export async function GET() {
  try {
    const stories = await fetchTopHNStories()
    if (stories.length === 0) {
      return NextResponse.json({ items: [] })
    }

    // Use Gemini to summarize if API key available
    const items = await Promise.all(
      stories.slice(0, 5).map(async (story) => {
        let summary: string | undefined

        if (process.env.GEMINI_API_KEY) {
          try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
            const result = await model.generateContent(
              `Summarize this tech news headline in 1 engaging sentence for a young developer audience. Keep it under 80 characters. Headline: "${story.title}"`
            )
            summary = result.response.text().trim()
          } catch {}
        }

        return {
          title: story.title,
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          source: 'Hacker News',
          summary,
        }
      })
    )

    return NextResponse.json({ items })
  } catch (err) {
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}
