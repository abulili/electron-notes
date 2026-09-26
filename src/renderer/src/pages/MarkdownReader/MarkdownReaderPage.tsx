import { useMemo, useState } from 'react'
import './MarkdownReaderPage.css'

type Heading = {
  id: string
  level: number
  text: string
}

function extractHeadings(markdown: string): Heading[] {
  return markdown
    .split('\n')
    .map((line, index) => {
      const match = /^(#{1,3})\s+(.+)$/.exec(line)

      if (!match) {
        return null
      }

      return {
        id: `heading-${index}`,
        level: match[1].length,
        text: match[2].trim()
      }
    })
    .filter((item): item is Heading => item !== null)
}

function MarkdownReaderPage(): React.JSX.Element {
  const [filePath, setFilePath] = useState('')
  const [content, setContent] = useState('')

  const headings = useMemo(() => extractHeadings(content), [content])

  const handleOpenFile = async (): Promise<void> => {
    const result = await window.api.openMarkdownFile()

    if (!result) {
      return
    }

    setFilePath(result.filePath)
    setContent(result.content)
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

        <pre className="markdown-reader__content">{content || '请选择一个 .md 文件'}</pre>
      </section>

      <aside className="markdown-reader__outline">
        <h2>大纲</h2>

        {headings.length > 0 ? (
          <nav>
            {headings.map((heading) => (
              <div
                key={heading.id}
                className={`markdown-reader__heading markdown-reader__heading--${heading.level}`}
              >
                {heading.text}
              </div>
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
