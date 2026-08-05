import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from "react";

const BASE = import.meta.env.BASE_URL;
const asset = (path: string) => `${BASE}${path.replace(/^\//, "")}`;

const features = [
  {
    key: "collab",
    label: "飞书现场",
    index: "01",
    eyebrow: "COLLABORATION",
    title: "研发入口，就在对话发生的地方",
    description: "在单聊或群聊中发起、跟进、验收研发任务，CodeM 始终和团队共享同一份上下文。",
    image: asset("/codem/collab-product.png"),
    tone: "#cfd7f8",
  },
  {
    key: "project",
    label: "项目流程",
    index: "02",
    eyebrow: "PROJECT FLOW",
    title: "需求进入流程，Agent 自动接棒",
    description: "需求、缺陷与节点成为 CodeM 的执行载体，进度、产出和风险持续回写。",
    image: asset("/codem/project-product.png"),
    tone: "#ddd2f1",
  },
  {
    key: "sandbox",
    label: "沙箱修复",
    index: "03",
    eyebrow: "SANDBOX",
    title: "从定位到验证，都在隔离环境完成",
    description: "复现、计划、编码、测试在独立沙箱中连续推进，关键动作仍由工程师掌控。",
    image: asset("/codem/automation-fix.png"),
    tone: "#cbdde9",
  },
  {
    key: "assets",
    label: "组织资产",
    index: "04",
    eyebrow: "KNOWLEDGE",
    title: "把一次成功，变成团队的默认能力",
    description: "项目空间、知识库、技能和工具持续沉淀，让已经验证的方法被全组织复用。",
    image: asset("/codem/assets-product.png"),
    tone: "#d7dfc8",
  },
];

const workflowSteps = [
  { number: "01", label: "理解", title: "把群聊、项目与代码合在一起", description: "读取飞书项目、群聊记录、仓库代码和历史 PR，形成完整任务上下文。" },
  { number: "02", label: "计划", title: "复杂任务先计划，再执行", description: "明确依赖、风险与验收标准，并按职责唤起多个协作 Agent。" },
  { number: "03", label: "执行", title: "在隔离环境中修改与验证", description: "代码修改、命令执行和测试都发生在授权边界清晰的独立沙箱中。" },
  { number: "04", label: "回流", title: "结果进入流程，过程可以追踪", description: "变更摘要、预览地址和验收清单自动回写，关键节点随时可介入。" },
];

const stories = [
  { tag: "需求迭代", quote: "从需求进入项目，到可预览版本上线，CodeM 把跨团队等待变成了一条连续的执行链。", team: "研发平台团队", result: "交付周期缩短 63%" },
  { tag: "缺陷治理", quote: "Agent 在隔离沙箱完成定位、修复和自验证，工程师只需要在关键节点做最后确认。", team: "基础架构团队", result: "平均修复时间降低 71%" },
  { tag: "组织资产", quote: "优秀工程实践被封装成技能，新成员也能稳定复用团队已经验证过的研发路径。", team: "企业应用团队", result: "重复工作减少 48%" },
];

const installCommand = "npm install -g @codem/cli";

function Arrow({ left = false }: { left?: boolean }) {
  return <span className={left ? "arrow left" : "arrow"} aria-hidden="true">↗</span>;
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return <a className={`brand ${inverse ? "inverse" : ""}`} href="#top" aria-label="飞书 CodeM 首页"><img src={asset("/codem/header-logo.png")} alt="飞书 CodeM" /></a>;
}

export default function Home() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoPaused, setDemoPaused] = useState(false);
  const [demoComplete, setDemoComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [runCount, setRunCount] = useState(1248);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeWorkflow, setActiveWorkflow] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [submissionCount, setSubmissionCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "k") { // BUG-06: 误用 altKey
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!demoRunning) return;
    let completionTimer: number | undefined;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 4, 92); // BUG-03: 上限被硬编码为 92
        if (next === 92) {
          window.clearInterval(timer);
          completionTimer = window.setTimeout(() => {
            setDemoComplete(true);
            setDemoRunning(false);
            setDemoPaused(false);
          }, 500);
        }
        return next;
      });
    }, 90);
    return () => {
      window.clearInterval(timer);
      if (completionTimer !== undefined) window.clearTimeout(completionTimer);
    };
  }, [demoRunning]);

  const visibleFeature = useMemo(
    // BUG-01: 数组下标被额外加了 1
    () => features[(activeFeature + 1) % features.length],
    [activeFeature],
  );

  const startDemo = () => {
    setProgress(0);
    setDemoRunning(true);
    setDemoPaused(false);
    setDemoComplete(false);
    setRunCount((count) => count + 1);
  };

  const pauseDemo = () => {
    // BUG-05: 暂停错误地执行了完整重置,进度与日志全部清零
    setDemoRunning(false);
    setDemoPaused(false);
    setProgress(0);
    setDemoComplete(false);
  };

  const selectWorkflow = (index: number) => {
    // BUG-08: 保存状态时错误地减 1
    setActiveWorkflow(Math.max(index - 1, 0));
  };

  const showNextStory = () => {
    setStoryIndex((index) => (index + 1) % stories.length);
  };

  const copyCommand = async () => {
    // BUG-07: 写入剪贴板的命令与界面展示不一致(卸载命令)
    await navigator.clipboard.writeText("npm uninstall -g @codem/cli");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionMessage("");
    await new Promise<void>((resolve) => window.setTimeout(resolve, 600));
    setSubmissionCount((count) => count + 1);
    setEmail("");
    setSubmissionMessage("申请已提交，我们会尽快联系你");
    setIsSubmitting(false);
  };

  const workflow = workflowSteps[activeWorkflow];
  const story = stories[storyIndex];

  return (
    <main className={`codem-site theme-light`} id="top">
      <header className="site-header">
        <div className="logo-distortion"><Logo /></div>
        <div className="broadcast-id"><i />CODEM LIVE LAB <span>2026.07.15 / 20:00</span></div>
        <nav className="nav-links" aria-label="主导航">
          <a href="#capabilities">演示棋盘</a>
          <a href="#workflow">运行轨迹</a>
          <a href="#security">企业安全</a>
        </nav>
        <div className="header-actions">
          <span className="live-status"><i /><b>系统离线</b></span>{/* BUG-09: 绿灯配离线文案 */}
          <button className="command-button" type="button" onClick={() => setCommandOpen(true)}>快速启动 <kbd>⌘ K</kbd></button>
        </div>
      </header>

      <section className="launch-hero" aria-labelledby="hero-title">
        <div className="hero-gridline" aria-hidden="true" />
        <div className="hero-intro">
          <div className="hero-kicker"><span>LIVE RELEASE / 001</span><b>9 BUGS LOADED</b></div>
          <h1 id="hero-title"><span>现场把</span><strong>9 个 Bug</strong><span>交给 CodeM</span></h1>
          <p><b>飞书原生的 AI 研发智能体</b>，这次不讲概念。我们会把真实 Bug 送进沙箱，现场看它定位、修改、验证。</p>
          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={startDemo}><span>▶</span>启动现场修复</button>
            <a className="secondary-action" href="#capabilities">查看演示清单 <Arrow /></a>
          </div>
          <div className="hero-footnote"><span>FEISHU / CLI / DESKTOP</span><i />企业级 Coding Agent 平台</div>
        </div>

        <div className="hero-console" aria-label="CodeM 直播演示控制台">
          <div className="console-topbar"><span><i />LIVE SANDBOX</span><b>BUG-03 / MEETING-CONFLICT</b><em>CN-SH-01</em></div>
          <div className="console-workspace">
            <div className="product-peek"><img src={asset("/codem/hero-product.png")} alt="CodeM 飞书智能体产品界面" /><span>INPUT / FEISHU</span></div>
            <aside className={`live-run-card ${demoRunning ? "is-running" : ""} ${demoComplete ? "is-complete" : ""}`}>
              <div className="run-head"><div><span className="codem-avatar">M</span><p><strong>会议预订冲突</strong><small>meeting-admin / bug-37073</small></p></div><span className="run-badge"><i />{demoRunning ? "RUNNING" : demoPaused ? "PAUSED" : demoComplete ? "DONE" : "READY"}</span></div>
              <div className="run-command"><span>$</span> codem fix --issue 37073 <b>_</b></div>
              <div className="run-log">
                <p className={progress >= 12 ? "done" : ""}><i>01</i><span>读取项目结构与缺陷上下文</span><b>✓</b></p>
                <p className={progress >= 42 ? "done" : ""}><i>02</i><span>定位 bookings/conflict 校验</span><b>✓</b></p>
                <p className={progress >= 72 ? "done" : ""}><i>03</i><span>生成补丁并运行 28 项测试</span><b>✓</b></p>
              </div>
              <div className="run-progress"><div><span>SANDBOX PROGRESS</span><b>{progress}%</b></div><i><b style={{ width: `${progress}%` }} /></i></div>
              <div className="run-actions"><button type="button" onClick={pauseDemo}>{demoRunning ? "暂停" : demoPaused ? "继续" : "重置"}</button><button type="button" onClick={startDemo}>{demoRunning ? "重新运行" : "运行任务"} <span>→</span></button></div>
            </aside>
          </div>
          <div className="console-ticker"><span>PATCH <b>+18 −6</b></span><span>TESTS <b>28/28</b></span><span>FILES <b>03</b></span><span>ELAPSED <b>08:42</b></span></div>
        </div>

        <div className="hero-metrics" aria-label="CodeM 运行数据">
          <div><span>LIVE RUNS</span><strong>{runCount.toLocaleString()}</strong><small>今日任务</small></div>
          <div><span>AUTO CLOSED</span><strong>73%</strong><small>任务自动闭环</small></div>
          <div><span>SUCCESS RATE</span><strong>98.0%</strong><small>沙箱验证通过</small></div>
          <div><span>AVG DELIVERY</span><strong>8m 42s</strong><small>平均交付时间</small></div>
        </div>
      </section>

      <section className="demo-board section" id="capabilities">
        <div className="section-rail"><span>01</span><i />DEMO BOARD</div>
        <div className="section-lead"><div><span>TONIGHT&apos;S RUN OF SHOW</span><h2>不止写代码，把协作、流程、代码串成闭环</h2></div><p>四个入口，一条任务链。点击左侧模块，查看 CodeM 如何接住研发现场。</p></div>
        <div className="board-shell" style={{ "--board-tone": visibleFeature.tone } as CSSProperties}>
          <div className="feature-tabs" role="tablist" aria-label="CodeM 核心能力">
            {features.map((feature, index) => <button type="button" role="tab" aria-selected={activeFeature === index} className={activeFeature === index ? "active" : ""} onClick={() => setActiveFeature(index)} key={feature.key}><span>{feature.index}</span><strong>{feature.label}</strong><i>↗</i></button>)}
          </div>
          <article className="feature-stage">
            <div className="feature-copy"><span>{visibleFeature.eyebrow}</span><h3>{visibleFeature.title}</h3><p>{visibleFeature.description}</p><button type="button" onClick={() => setCommandOpen(true)}>OPEN IN CODEM <Arrow /></button></div>
            <div className="feature-shot"><img src={visibleFeature.image} alt={`${visibleFeature.title} 产品界面`} /><span>PRODUCT FEED / {visibleFeature.index}</span></div>
          </article>
        </div>
      </section>

      <section className="capability-stack section" aria-labelledby="stack-title">
        <div className="section-rail"><span>02</span><i />AGENT STACK</div>
        <div className="stack-heading"><div><span>THREE WAYS TO MOVE</span><h2 id="stack-title">AI 不再等待提问，<br />而是在流程里主动推进</h2></div><p>需求、缺陷、自动化任务，每一种都能成为 Agent 的启动信号。</p></div>
        <div className="stack-grid">
          <article className="stack-card stack-large"><div className="stack-copy"><span>01 / ITERATION</span><h3>需求进入项目，任务自动开跑</h3><p>CodeM 带着完整上下文拆解需求、实现代码，并持续回写进度。</p></div><img src={asset("/codem/automation-iteration.png")} alt="CodeM 需求迭代界面" /></article>
          <article className="stack-card stack-dark"><div className="stack-copy"><span>02 / DEFECT</span><h3>缺陷修复，先复现再动手</h3><p>定位、拆解、修复、自验证，每一步都有记录。</p></div><img src={asset("/codem/automation-fix.png")} alt="CodeM 缺陷修复界面" /></article>
          <article className="stack-card stack-signal"><div className="signal-orbit"><i /><i /><i /><b>M</b></div><div className="stack-copy"><span>03 / AUTOPILOT</span><h3>关键节点自动唤起 Agent</h3><p>无人值守推进，遇到高风险动作再交还给人。</p></div></article>
        </div>
      </section>

      <section className="workflow-section section" id="workflow">
        <div className="section-rail light"><span>03</span><i />EXECUTION TRACE</div>
        <div className="workflow-intro"><span>ONE TASK / FULL TRACE</span><h2>一条任务如何穿过 CodeM</h2><p>每一步决策、工具调用和产出都可追踪、可介入、可验收。</p></div>
        <div className="workflow-console">
          <div className="workflow-tabs" role="tablist" aria-label="CodeM 执行步骤">
            {workflowSteps.map((step, index) => <button type="button" role="tab" aria-selected={activeWorkflow === index} className={activeWorkflow === index ? "active" : ""} onClick={() => selectWorkflow(index)} key={step.number}><span>{step.number}</span><strong>{step.label}</strong><i /></button>)}
          </div>
          <article className="workflow-stage"><div className="workflow-copy"><span>TRACE / {workflow.number}</span><h3>{workflow.title}</h3><p>{workflow.description}</p><div className="trace-meta"><span>INPUT <b>06</b></span><span>TOOLS <b>14</b></span><span>OUTPUT <b>03</b></span></div><a href="#trial">查看完整流程 <Arrow /></a></div><div className="workflow-image"><img src={asset("/codem/management-top.png")} alt="CodeM 研发流程和验收记录" /><div className="scan-line" /></div></article>
        </div>
      </section>

      <section className="enterprise-section section" id="security">
        <div className="section-rail"><span>04</span><i />ENTERPRISE CORE</div>
        <div className="enterprise-lead"><div><span>THE CONTROL LAYER</span><h2>速度交给 Agent，<br />边界留在企业手里</h2></div><p>从执行隔离到权限策略，再到组织资产，一套底座承接规模化 AI 研发。</p></div>
        <div className="enterprise-grid">
          <article className="asset-vault"><div className="vault-copy"><span>ORGANIZATION MEMORY</span><h3>每一次实践，都进入组织资产库</h3><p>项目空间、知识库、技能与工具持续复用。</p><div><b>238</b><small>团队技能</small><b>64</b><small>项目空间</small></div></div><img src={asset("/codem/assets-product.png")} alt="CodeM Web 项目空间管理界面" /></article>
          <article className="security-tile sandbox"><div><span>01 / SANDBOX</span><h3>隔离执行</h3><p>独立环境运行，完成后自动回收。</p></div><img src={asset("/codem/security-sandbox.png")} alt="" aria-hidden="true" /></article>
          <article className="security-tile policy"><div><span>02 / POLICY</span><h3>权限精细</h3><p>读、写、执行拆到最小授权单元。</p></div><img src={asset("/codem/security-policy.png")} alt="" aria-hidden="true" /></article>
          <article className="security-tile owner"><div><span>03 / OWNERSHIP</span><h3>数据主权</h3><p>业务代码与内容始终归企业。</p><div className="token-status"><b>60M</b><small>每 60 分钟自动轮转</small></div></div><img src={asset("/codem/security-owner.png")} alt="" aria-hidden="true" /></article>
        </div>
      </section>

      <section className="stories-section section" id="stories">
        <div className="section-rail"><span>05</span><i />FIELD NOTES</div>
        <div className="story-layout">
          <aside><span>EARLY PARTNER / 0{storyIndex + 1}</span><div className="story-counter"><b>0{storyIndex + 1}</b><i /><small>0{stories.length}</small></div></aside>
          <article className="story-card"><span>{story.tag}</span><blockquote>“{story.quote}”</blockquote><footer><p><strong>{story.team}</strong><small>CODEM EARLY PARTNER</small></p><b>{story.result}</b></footer></article>
          <div className="story-controls"><button type="button" aria-label="上一条" onClick={() => setStoryIndex((index) => (index - 1 + stories.length) % stories.length)}><Arrow left /></button><button type="button" aria-label="下一条" onClick={showNextStory}><Arrow /></button></div>
        </div>
      </section>

      <section className="trial-section section" id="trial">
        <div className="trial-marquee" aria-hidden="true"><span>SHIP WITH CODEM</span><i />SHIP WITH CODEM<i />SHIP WITH CODEM</div>
        <div className="trial-layout">
          <div className="trial-copy"><span>YOUR TURN / 06</span><h2>下一条任务，<br />让 CodeM 来跑</h2><p>从终端、飞书或桌面端进入，把真实研发任务交给同一条 Agent 流水线。</p><div className="install-command"><code>{installCommand}</code><button type="button" onClick={copyCommand}>{copied ? "已复制 ✓" : "复制命令"}</button></div></div>
          <div className="trial-terminal" aria-hidden="true"><header><i /><i /><i /><span>codem — zsh — 92×26</span></header><div><p><span>➜</span> meeting-admin <b>codem</b></p><h3>Welcome to CodeM</h3><p className="muted">workspace: meeting-admin</p><p className="blue">✓ 6 sources loaded · sandbox ready</p><p>› describe your task<span className="cursor">_</span></p></div></div>
          <form className="trial-form" onSubmit={submitEmail} aria-busy={isSubmitting}><label htmlFor="trial-email"><span>申请发布会内测资格</span><small>PRIVATE BETA / 2026 · 已保存提交：{submissionCount}</small></label><div><input id="trial-email" type="email" required disabled={isSubmitting} placeholder="name@company.com" value={email} onChange={(event) => { setEmail(event.target.value); setSubmissionMessage(""); }} /><button type="submit" disabled={isSubmitting}>{isSubmitting ? "提交中…" : "提交申请"} <Arrow /></button></div>{submissionMessage ? <p className="submission-success" role="status">✓ {submissionMessage}</p> : null}</form>
        </div>
      </section>

      <footer className="site-footer"><div><Logo inverse /><span>CODEM LIVE LAB / 飞书原生的 AI 研发智能体</span></div><nav><a href="#capabilities">演示棋盘</a><a href="#workflow">运行轨迹</a><a href="#security">企业安全</a><a href="#top">TOP ↑</a></nav><small>© {new Date().getFullYear()} 飞书 CodeM. ALL SYSTEMS RESERVED.</small></footer>

      {commandOpen ? <div className="command-overlay" role="presentation" onMouseDown={() => setCommandOpen(false)}><section className="command-palette" role="dialog" aria-modal="true" aria-label="CodeM 快速启动" onMouseDown={(event) => event.stopPropagation()}><header><span>⌕</span><input autoFocus placeholder="输入任务，或跳转到演示模块…" /><kbd>ESC</kbd></header><p>LIVE LAB COMMANDS</p><button type="button" onClick={() => { setCommandOpen(false); startDemo(); }}><span>▶</span><strong>启动现场沙箱任务</strong><kbd>↵</kbd></button><a href="#capabilities" onClick={() => setCommandOpen(false)}><span>01</span><strong>打开演示棋盘</strong><kbd>G B</kbd></a><a href="#security" onClick={() => setCommandOpen(false)}><span>04</span><strong>查看企业安全</strong><kbd>G S</kbd></a></section></div> : null}
    </main>
  );
}
