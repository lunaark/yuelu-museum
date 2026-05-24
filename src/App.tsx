import {
  Box,
  Camera,
  ChevronDown,
  Heart,
  Info,
  Leaf,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CellScene } from "./components/CellScene";
import { asset, cells, getCellById, type CellItem, type ViewMode } from "./data/cells";


const initialCell = getCellById("owlZun");

function Header({ cell }: { cell: CellItem }) {
  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-orb" aria-hidden="true">
          <img src={asset("/logo.png")} alt="" />
        </div>
        <div>
          <h1>华夏文物数字展厅</h1>
          <p>穿越千年，触摸文明的温度</p>
        </div>
      </div>

      <div className="topbar-tag">
        <span>月鹿造物</span>
        <em>8 件中国文物 · 3D 数字典藏</em>
      </div>
    </header>
  );
}

type SidebarProps = {
  selectedCell: CellItem;
  activeOrganelle: string;
  favorites: Set<string>;
  onSelectCell: (id: string) => void;
  onSelectOrganelle: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

function MiniCell({ cell }: { cell: CellItem }) {
  return (
    <span className="mini-cell has-preview" style={{ "--thumb": cell.accent } as CSSProperties}>
      <img src={asset(cell.thumbnail)} alt="" aria-hidden="true" />
    </span>
  );
}

function Sidebar({
  selectedCell,
  activeOrganelle,
  favorites,
  onSelectCell,
  onSelectOrganelle,
  onToggleFavorite,
}: SidebarProps) {
  return (
    <aside className="left-rail">
      <section className="panel cell-type-panel">
        <div className="panel-heading">
          <span>
            <Leaf size={18} />
            文物分类 · 按年代
          </span>
          <ChevronDown size={18} />
        </div>

        <div className="cell-list">
          {cells.map((cell) => {
            const selected = selectedCell.id === cell.id;
            return (
              <button
                className={`cell-row ${selected ? "is-active" : ""}`}
                type="button"
                key={cell.id}
                onClick={() => onSelectCell(cell.id)}
              >
                <MiniCell cell={cell} />
                <span className="cell-row-copy">
                  <strong>{cell.name}</strong>
                  <span>{cell.type}</span>
                </span>
                <span className="era-badge">{cell.era}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel about-panel">
        <div className="about-head">
          <Info size={15} />
          <span>关于本展</span>
        </div>
        <p>
          8 件中国文物的 3D 数字典藏，跨越商代至明清三千余年。其中 5 件现流落海外，
          愿你在屏幕前，也能与它们隔空相望。
        </p>
      </section>
    </aside>
  );
}

type StageProps = {
  cell: CellItem;
  activeOrganelle: string;
  viewMode: ViewMode;
  crossSection: boolean;
  autoRotate: boolean;
  resetKey: number;
  onModeChange: (mode: ViewMode) => void;
  onCrossSectionChange: (value: boolean) => void;
  onAutoRotateChange: (value: boolean) => void;
  onReset: () => void;
  onToast: (message: string) => void;
};

function Stage({
  cell,
  activeOrganelle,
  viewMode,
  crossSection,
  autoRotate,
  resetKey,
  onModeChange,
  onCrossSectionChange,
  onAutoRotateChange,
  onReset,
  onToast,
}: StageProps) {
  function captureScreenshot() {
    const canvas =
      document.querySelector<HTMLCanvasElement>("canvas.cell-canvas") ??
      document.querySelector<HTMLCanvasElement>(".canvas-wrap canvas");
    if (!canvas) {
      onToast("没有找到模型画面。");
      return;
    }
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) {
      onToast("画面尚未就绪，请稍候再试。");
      return;
    }
    const pad = Math.round(h * 0.12);
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h + pad;
    const ctx = out.getContext("2d");
    if (!ctx) {
      onToast("截图失败。");
      return;
    }
    // 背景
    ctx.fillStyle = "#fbf7ee";
    ctx.fillRect(0, 0, out.width, out.height);
    // 模型画面
    ctx.drawImage(canvas, 0, 0, w, h);
    // 底部水印：文物名 + 展厅署名
    const cx = out.width / 2;
    const baseY = h + pad * 0.42;
    ctx.textAlign = "center";
    ctx.fillStyle = "#2d261e";
    ctx.font = `600 ${Math.round(h * 0.045)}px "Iowan Old Style", Georgia, serif`;
    ctx.fillText(`${cell.name} · ${cell.dynasty}`, cx, baseY);
    ctx.fillStyle = "rgba(55,48,40,0.5)";
    ctx.font = `${Math.round(h * 0.028)}px sans-serif`;
    ctx.fillText("月鹿造物 · 华夏文物数字展厅", cx, baseY + pad * 0.36);

    try {
      const url = out.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cell.name}-月鹿造物.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      onToast("已保存截图。");
    } catch (e) {
      onToast("截图失败：" + String(e).slice(0, 60));
    }
  }

  return (
    <main className="stage-column">
      <section className="stage-panel">
        <div className="artifact-plaque">
          <div className="plaque-step">一 · 它是什么</div>
          <h2>{cell.name}</h2>
          <p className="plaque-type">{cell.type}</p>
          <p className="plaque-intro">{cell.intro}</p>
          <div className="plaque-meta">
            <div className="plaque-meta-item">
              <span className="plaque-label">年代</span>
              <span className="plaque-value">{cell.dynasty}</span>
            </div>
            <div className="plaque-meta-item">
              <span className="plaque-label">出土地</span>
              <span className="plaque-value">{cell.occurrence.title}</span>
            </div>
            <div className="plaque-meta-item">
              <span className="plaque-label">现藏</span>
              <span className={`plaque-value ${cell.museumAbroad ? "is-abroad" : ""}`}>
                {cell.museum}
                {cell.museumAbroad && <em className="abroad-tag">流落海外</em>}
              </span>
            </div>
          </div>
        </div>

        <div className="canvas-wrap">
          <CellScene
            cell={cell}
            activeOrganelle={activeOrganelle}
            viewMode={viewMode}
            crossSection={crossSection}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </div>

        <div className="stage-toolbar">
          <button
            type="button"
            className={autoRotate ? "is-active" : ""}
            onClick={() => onAutoRotateChange(!autoRotate)}
          >
            <RotateCcw size={20} />
            自动旋转
          </button>
          <button type="button" onClick={onReset}>
            <RotateCcw size={20} />
            重置视角
          </button>
          <button type="button" onClick={captureScreenshot}>
            <Camera size={20} />
            截图保存
          </button>
        </div>

        <p className="stage-hint">
          <Box size={15} />
          拖动旋转 · 滚轮缩放 · 在右侧切换部件，凑近看细节
        </p>
      </section>
    </main>
  );
}

type RightPanelProps = {
  cell: CellItem;
  activeOrganelle: string;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelectPart: (id: string) => void;
};

function RightPanel({
  cell,
  activeOrganelle,
  favorites,
  onToggleFavorite,
  onSelectPart,
}: RightPanelProps) {
  const organelle = cell.organelles.find((item) => item.id === activeOrganelle) ?? cell.organelles[0];
  const [openInsight, setOpenInsight] = useState(false);

  return (
    <aside className="right-rail">
      <section className="panel details-panel">
        <div className="panel-heading detail-heading">
          <span>二 · 看门道 · 细节</span>
          <button type="button" onClick={() => onToggleFavorite(cell.id)} aria-label="收藏">
            <Heart size={22} fill={favorites.has(cell.id) ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="part-tabs">
          {cell.organelles.map((part) => (
            <button
              type="button"
              key={part.id}
              className={`part-tab ${activeOrganelle === part.id ? "is-active" : ""}`}
              onClick={() => onSelectPart(part.id)}
            >
              <span className="color-dot" style={{ background: part.color }} />
              {part.name}
            </button>
          ))}
        </div>

        <div className="detail-hero no-orb">
          <div>
            <h3>{organelle.name}</h3>
            <p>{organelle.subtitle}</p>
          </div>
        </div>

        <p className="part-note">{organelle.note}</p>
      </section>

      {cell.story && (
        <section className="panel story-panel">
          <div className="panel-heading">
            <span>三 · 听它说 · 文物的故事</span>
          </div>
          {cell.story.split("\n\n").map((para, i) => (
            <p key={i} className="story-text">{para}</p>
          ))}
        </section>
      )}

      {cell.qa && cell.qa.length > 0 && (
        <section className="panel qa-panel">
          <div className="panel-heading">
            <span>四 · 你可能好奇</span>
          </div>
          <div className="qa-list">
            {cell.qa.map((item, i) => (
              <QAItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
      )}

      {!cell.story && (
        <section className="panel collapse-panel">
          <button
            type="button"
            className="collapse-head"
            onClick={() => setOpenInsight((v) => !v)}
          >
            <span>三 · 以小见大 · 文化内涵</span>
            <ChevronDown size={18} className={openInsight ? "is-open" : ""} />
          </button>
          {openInsight && (
            <div className="collapse-body">
              <p>{cell.occurrence.body}</p>
              <div className="fun-fact" style={{ marginTop: 14 }}>
                <Sparkles size={18} />
                <span>{organelle.fact}</span>
              </div>
            </div>
          )}
        </section>
      )}
    </aside>
  );
}

function QAItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`qa-item ${open ? "is-open" : ""}`}>
      <button type="button" className="qa-question" onClick={() => setOpen((v) => !v)}>
        <span>{q}</span>
        <ChevronDown size={17} className={open ? "is-open" : ""} />
      </button>
      {open && <p className="qa-answer">{a}</p>}
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return <div className="toast">{message}</div>;
}

export default function App() {
  const [selectedCellId, setSelectedCellId] = useState(initialCell.id);
  const [activeOrganelle, setActiveOrganelle] = useState(initialCell.defaultOrganelle);
  const [viewMode, setViewMode] = useState<ViewMode>("mesh");
  const [crossSection, setCrossSection] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set([initialCell.id]));
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const selectedCell = useMemo(() => getCellById(selectedCellId), [selectedCellId]);

  useEffect(() => {
    setActiveOrganelle(selectedCell.defaultOrganelle);
  }, [selectedCell]);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const shellStyle = {
    "--accent": selectedCell.accent,
    "--accent-soft": selectedCell.accentSoft,
    "--cell-color": selectedCell.color,
  } as CSSProperties;

  return (
    <div className="app-shell" style={shellStyle}>
      <Header cell={selectedCell} />

      <div className="app-grid">
        <Sidebar
          selectedCell={selectedCell}
          activeOrganelle={activeOrganelle}
          favorites={favorites}
          onSelectCell={setSelectedCellId}
          onSelectOrganelle={setActiveOrganelle}
          onToggleFavorite={toggleFavorite}
        />

        <div className="center-stack">
          <Stage
            cell={selectedCell}
            activeOrganelle={activeOrganelle}
            viewMode={viewMode}
            crossSection={crossSection}
            autoRotate={autoRotate}
            resetKey={resetKey}
            onModeChange={setViewMode}
            onCrossSectionChange={setCrossSection}
            onAutoRotateChange={setAutoRotate}
            onReset={() => {
              setResetKey((key) => key + 1);
              showToast("视角已重置。");
            }}
            onToast={showToast}
          />
        </div>

        <RightPanel
          cell={selectedCell}
          activeOrganelle={activeOrganelle}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectPart={setActiveOrganelle}
        />
      </div>

      <footer className="site-footer">
        <div className="footer-brand">
          <Sparkles size={16} />
          <span>月鹿造物 · 华夏文物数字展厅</span>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <h4>界面灵感</h4>
            <p>
              基于开源项目{" "}
              <a href="https://github.com/cclank/cell-architecture-studio" target="_blank" rel="noopener">
                Cell Architecture Studio
              </a>{" "}
              改造，由细胞科普展厅重构为中国文物数字展厅。
            </p>
            <div className="footer-contact">
              <span className="contact-label">公众号</span>
              <span className="contact-value">月鹿造物</span>
              <span className="contact-label">小红书</span>
              <span className="contact-value">月鹿造物</span>
            </div>
          </div>
          <div className="footer-col">
            <h4>3D 模型来源</h4>
            <p>
              全部模型来自{" "}
              <a href="https://sketchfab.com" target="_blank" rel="noopener">Sketchfab</a>
              ，遵循各自的 CC 协议：
            </p>
            <ul>
              {cells.map((cell) => (
                <li key={cell.id}>
                  <a href={cell.modelAsset?.sourceUrl} target="_blank" rel="noopener">
                    {cell.name}
                  </a>{" "}
                  © {cell.modelAsset?.sourceLabel}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>

      <Toast message={toast} />
    </div>
  );
}
