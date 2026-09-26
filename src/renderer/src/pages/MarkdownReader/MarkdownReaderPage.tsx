import { useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// 内容处理框架，用来装插件的
import { unified } from 'unified'
// md解析插件，基于unified
import remarkParse from 'remark-parse'
// 把 AST 节点里的文字提取出来
import { toString } from 'mdast-util-to-string'
// md AST根节点，标题节点，Heading重命名为MdastHeading
import type { Root, Heading as MdastHeading } from 'mdast'
import './MarkdownReaderPage.css'


type Heading = {
  id: string
  level: number
  text: string
  lineIndex: number
}

function createHeadingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractHeadings(markdown: string): Heading[] {
  /**
   会解析成类似结构的，但是又不全是文字，所以需要toString
   {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 1,
        children: [{ type: 'text', value: 'Electron' }]
      },
   */

  // unified创建处理器。use(remarkParse)安装md解析插件。.parse(markdown)把 Markdown 字符串解析成 AST。as Root告诉 TypeScript：这个解析结果按 Markdown AST 的根节点类型看待。
  // 把 markdown 字符串解析成 Markdown AST 树
  const tree = unified().use(remarkParse).parse(markdown) as Root
  const headings: Heading[] = []

  tree.children.forEach((node, index) => {
    if (node.type !== 'heading') {
      return
    }
    const headingNode = node as MdastHeading
    const text = toString(headingNode).trim()

    if (!text) {
      return
    }
    headings.push({
      id: createHeadingId(text),
      level: headingNode.depth,
      text,
      /**
       * 记录这个标题在 Markdown 文件里的第几行。
       * headingNode.position是AST节点的位置信息。remark-parse 解析 Markdown 时，会记录每个节点在原文里的位置。
       position: {
        start: {
          line: 12,
          column: 1,
          offset: 230
        },
        end: {
          line: 12,
          column: 8,
          offset: 237
        }
      }
      如果 headingNode.position?.start.line 是 null 或 undefined
      就用 index 作为备用值
       */
      lineIndex: headingNode.position ? headingNode.position.start.line - 1 : index
    })
  })
  return headings
}

function getPlainText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(getPlainText).join('')
  }

  if (children && typeof children === 'object' && 'props' in children) {
    return getPlainText((children as ReactElement<{ children?: ReactNode }>).props.children)
  }

  return ''
}

function MarkdownReaderPage(): React.JSX.Element {
  const [filePath, setFilePath] = useState('')
  const [content, setContent] = useState('')

  // 在组件重新渲染时，缓存（记忆）某个计算结果，只有当依赖项发生变化时，才重新计算。
  const headings = useMemo(() => extractHeadings(content), [content])

  const handleOpenFile = async (): Promise<void> => {
    const result = await window.api.openMarkdownFile()

    if (!result) {
      return
    }

    setFilePath(result.filePath)
    setContent(result.content)
  }
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
            // ReactMarkdown：把 Markdown 字符串 content 渲染成 React 页面。从 # 到 <h1>
            // remarkGfm 支持 GitHub 风格 Markdown，
            // components 是：自定义 Markdown 元素怎么渲染。
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => {
                  const text = getPlainText(children).trim()
                  return <h1 id={createHeadingId(text)}>{children}</h1>
                },
                h2: ({ children }) => {
                  const text = getPlainText(children).trim()
                  return <h2 id={createHeadingId(text)}>{children}</h2>
                },
                h3: ({ children }) => {
                  const text = getPlainText(children).trim()
                  return <h3 id={createHeadingId(text)}>{children}</h3>
                },
                h4: ({ children }) => {
                  const text = getPlainText(children).trim()
                  return <h4 id={createHeadingId(text)}>{children}</h4>
                },
                h5: ({ children }) => {
                  const text = getPlainText(children).trim()
                  return <h5 id={createHeadingId(text)}>{children}</h5>
                },
                h6: ({ children }) => {
                  const text = getPlainText(children).trim()
                  return <h6 id={createHeadingId(text)}>{children}</h6>
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
