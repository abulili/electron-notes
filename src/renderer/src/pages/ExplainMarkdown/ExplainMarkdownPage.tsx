import { useMemo, useState } from 'react'
import './ExplainMarkdownPage.css'

type Explanation = {
  id: string
  title: string
  content: string
}

const markdown = `Electron 是 [[桌面应用框架|Electron 可以用 Web 技术开发 Windows、macOS、Linux 桌面软件]]。
React 负责 [[渲染进程|渲染进程就是用户看到的页面，通常写 React、Vue 或普通 HTML 页面]]。
preload 是 [[安全桥|preload 用来安全地把少量主进程能力暴露给页面，不建议直接在页面打开 Node 权限]]。`

/**
 * 函数（参数列表）：{返回类型}{函数体}
 */
type ParseResult = {
  parts: Array<string | Explanation> // 切分
  explanations: Explanation[] // 解释
}
function parseExplainMarkdown(text: string): ParseResult {
  const explanations: Explanation[] = []
  const parts: Array<string | Explanation> = []

  const reg = /\[\[([^|\]]+)\|([^\]]+)\]\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = reg.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const item = {
      id: `explanation-${explanations.length + 1}`,
      title: match[1],
      content: match[2]
    }

    explanations.push(item)
    parts.push(item)
    lastIndex = reg.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return { parts, explanations }
}

function ExplainMarkdownPage(): React.JSX.Element {
  const [activeId, setActiveId] = useState<string | null>(null)

  const { parts, explanations } = useMemo(() => parseExplainMarkdown(markdown), [])
  const activeExplanation = explanations.find((item) => item.id === activeId)

  return (
    <main className="explain-page">
      <section className="explain-page__workspace">
        <header className="explain-page__header">
          <h1>Markdown 解释笔记</h1>
          <p>点击正文里的高亮词，右侧会显示对应解释。</p>
        </header>

        <article className="explain-page__document">
          {parts.map((part, index) => {
            if (typeof part === 'string') {
              return <span key={index}>{part}</span>
            }

            const isActive = part.id === activeId

            return (
              <button
                key={part.id}
                className={
                  isActive
                    ? 'explain-page__mark explain-page__mark--active'
                    : 'explain-page__mark'
                }
                onClick={() => setActiveId(isActive ? null : part.id)}
              >
                {part.title}
              </button>
            )
          })}
        </article>
      </section>

      <aside className="explain-page__panel">
        {activeExplanation ? (
          <>
            <div className="explain-page__panel-header">
              <h2>{activeExplanation.title}</h2>
              <button
                className="explain-page__close"
                onClick={() => setActiveId(null)}
              >
                关闭
              </button>
            </div>
            <p>{activeExplanation.content}</p>
          </>
        ) : (
          <div className="explain-page__empty">还没有选择解释词</div>
        )}
      </aside>
    </main>
  )
}

export default ExplainMarkdownPage
