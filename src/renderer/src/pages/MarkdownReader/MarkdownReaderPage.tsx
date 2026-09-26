import { useMemo, useState } from 'react'
import './MarkdownReaderPage.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Heading = {
  id: string
  level: number
  text: string,
  lineIndex: number
}

function createHeadingId(text: string, index: number): string {
  return `heading-${index}-${text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')}`
}

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = []
  const lines = markdown.split('\n')
  let inCodeBlock = false

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith('```') || trimmedLine.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock
      return
    }

    if (inCodeBlock) {
      return
    }

    const match = /^(#{1,5})\s+(.+)$/.exec(line)

    if (!match) {
      return
    }

    headings.push({
      id: createHeadingId(match[2].trim(), index),
      level: match[1].length,
      text: match[2].trim(),
      lineIndex: index
    })
  })

  return headings
}


function MarkdownReaderPage(): React.JSX.Element {
  const [filePath, setFilePath] = useState('')
  const [content, setContent] = useState('')

  // ？
  const headings = useMemo(() => extractHeadings(content), [content])

  // 标题索引
  const headingIdMap = useMemo(() => {
    const map = new Map<string, string>()

    headings.forEach((heading) => {
      map.set(`${heading.level}:${heading.text}`, heading.id)
    })

    return map
  }, [headings])

  const handleOpenFile = async (): Promise<void> => {
    const result = await window.api.openMarkdownFile()

    if (!result) {
      return
    }

    setFilePath(result.filePath)
    setContent(result.content)
  }

  const lines = useMemo(() => content.split('\n'), [content])
  const handleScrollToHeading = (heading: Heading): void => {
    const element = document.getElementById(heading.id)

    if (!element) {
      return
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="markdown-reader">
      <section className="markdown-reader__main">
        <header className="markdown-reader__header">
          <div>
            <h1>Markdown 阅读器</h1>
            <p>{filePath || '还没有打开 Markdown 文件'}</p>
          </div>

          <button onClick={handleOpenFile}>打开文件</button>
        </header>

        <div className="markdown-reader__content markdown-body">
          {content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              // ？
              components={{
                h1: ({ children }) => {
                  const text = String(children)
                  const id = headingIdMap.get(`1:${text}`)

                  return <h1 id={id}>{children}</h1>
                },
                h2: ({ children }) => {
                  const text = String(children)
                  const id = headingIdMap.get(`2:${text}`)

                  return <h2 id={id}>{children}</h2>
                },
                h3: ({ children }) => {
                  const text = String(children)
                  const id = headingIdMap.get(`3:${text}`)

                  return <h3 id={id}>{children}</h3>
                },
                h4: ({ children }) => {
                  const text = String(children)
                  const id = headingIdMap.get(`4:${text}`)

                  return <h4 id={id}>{children}</h4>
                },
                h5: ({ children }) => {
                  const text = String(children)
                  const id = headingIdMap.get(`5:${text}`)

                  return <h5 id={id}>{children}</h5>
                }
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <div className="markdown-reader__empty-content">请选择一个 .md 文件</div>
          )}
        </div>
      </section>

      <aside className="markdown-reader__outline">
        <h2>大纲</h2>

        {headings.length > 0 ? (
          <nav>
            {headings.map((heading) => (
              <button
                key={heading.id}
                className={`markdown-reader__heading markdown-reader__heading--${heading.level}`}
                onClick={() => handleScrollToHeading(heading)}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        ) : (
          <p>当前文件没有标题</p>
        )}
      </aside>
    </main>
  )
}

export default MarkdownReaderPage
