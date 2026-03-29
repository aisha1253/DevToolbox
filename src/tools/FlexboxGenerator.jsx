import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "../components/ToastProvider";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const FLEX_DIRECTION = ["row", "row-reverse", "column", "column-reverse"];
const JUSTIFY_CONTENT = [
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
  "space-evenly",
];
const ALIGN_ITEMS = ["flex-start", "center", "flex-end", "stretch", "baseline"];
const FLEX_WRAP = ["nowrap", "wrap", "wrap-reverse"];

const GRID_PLACE_ITEMS = ["start", "center", "end", "stretch"];
const COL_UNITS = ["fr", "px", "auto", "%"];
const ROW_UNITS = ["fr", "px", "auto"];

const PREVIEW_ITEM_COLORS = [
  "#2b7a78",
  "#3aafa9",
  "#5ec4be",
  "#36555c",
  "#1e5c59",
  "#0f766e",
  "#0d9488",
  "#115e59",
];

function defaultColTrack() {
  return { value: 1, unit: "fr" };
}

function defaultRowTrack() {
  return { value: 1, unit: "fr" };
}

function formatColTrack(t) {
  if (t.unit === "auto") return "auto";
  const v = Number(t.value);
  const safe = Number.isFinite(v) && v >= 0 ? v : 1;
  if (t.unit === "fr") return `${safe}fr`;
  if (t.unit === "px") return `${Math.round(safe)}px`;
  if (t.unit === "%") return `${safe}%`;
  return "1fr";
}

function formatRowTrack(t) {
  if (t.unit === "auto") return "auto";
  const v = Number(t.value);
  const safe = Number.isFinite(v) && v >= 0 ? v : 1;
  if (t.unit === "fr") return `${safe}fr`;
  if (t.unit === "px") return `${Math.round(safe)}px`;
  return "1fr";
}

const inputClass =
  "w-full min-w-0 rounded-lg border border-slate-200 bg-[#f8fafc] px-2 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#3aafa9] disabled:opacity-50 dark:border-slate-500/50 dark:bg-[rgba(15,23,42,0.65)] dark:text-slate-100 sm:max-w-[5rem]";

function SliderRow({ label, value, min, max, step, suffix = "", onChange }) {
  const display =
    step < 1
      ? parseFloat(Number(value).toFixed(2))
      : Math.round(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {label}
        </span>
        <span className="tabular-nums text-slate-600 dark:text-slate-300">
          {display}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[#36555c] dark:accent-[#5ec4be]"
      />
    </div>
  );
}

function OptionButtonGroup({ label, value, options, onChange }) {
  const inactive =
    "rounded-lg border border-slate-200 bg-[#f8fafc] px-2.5 py-1.5 text-left text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-500/40 dark:bg-[rgba(15,23,42,0.5)] dark:text-slate-200 dark:hover:bg-[rgba(15,23,42,0.75)]";
  const active =
    "dt-btn rounded-lg px-2.5 py-1.5 text-xs font-medium";

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={value === opt ? active : inactive}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function UnitChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "dt-btn rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
          : "rounded border border-slate-200 bg-[#f8fafc] px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-700 dark:border-slate-500/40 dark:bg-[rgba(15,23,42,0.5)] dark:text-slate-300"
      }
    >
      {children}
    </button>
  );
}

function ColTrackRow({ index, track, onChange }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200/80 p-2 dark:border-slate-600/40">
      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
        Column {index + 1}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={0}
          step={track.unit === "px" ? 1 : 0.1}
          disabled={track.unit === "auto"}
          value={track.unit === "auto" ? "" : track.value}
          onChange={(e) => {
            const raw = e.target.value;
            onChange({
              value: raw === "" ? 0 : Number(raw),
            });
          }}
          className={inputClass}
          aria-label={`Column ${index + 1} size`}
        />
        <div className="flex flex-wrap gap-1">
          {COL_UNITS.map((u) => (
            <UnitChip
              key={u}
              active={track.unit === u}
              onClick={() =>
                onChange({
                  unit: u,
                  value: u === "auto" ? track.value : track.value || 1,
                })
              }
            >
              {u}
            </UnitChip>
          ))}
        </div>
      </div>
    </div>
  );
}

function RowTrackRow({ index, track, onChange }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200/80 p-2 dark:border-slate-600/40">
      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
        Row {index + 1}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={0}
          step={track.unit === "px" ? 1 : 0.1}
          disabled={track.unit === "auto"}
          value={track.unit === "auto" ? "" : track.value}
          onChange={(e) => {
            const raw = e.target.value;
            onChange({
              value: raw === "" ? 0 : Number(raw),
            });
          }}
          className={inputClass}
          aria-label={`Row ${index + 1} size`}
        />
        <div className="flex flex-wrap gap-1">
          {ROW_UNITS.map((u) => (
            <UnitChip
              key={u}
              active={track.unit === u}
              onClick={() =>
                onChange({
                  unit: u,
                  value: u === "auto" ? track.value : track.value || 1,
                })
              }
            >
              {u}
            </UnitChip>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FlexboxGenerator() {
  const { pushToast } = useToast();

  const [layoutMode, setLayoutMode] = React.useState("flex");
  const [flexDirection, setFlexDirection] = React.useState("row");
  const [justifyContent, setJustifyContent] = React.useState("flex-start");
  const [alignItems, setAlignItems] = React.useState("stretch");
  const [flexWrap, setFlexWrap] = React.useState("nowrap");

  const [gridColCount, setGridColCount] = React.useState(3);
  const [colTracks, setColTracks] = React.useState([
    defaultColTrack(),
    defaultColTrack(),
    defaultColTrack(),
  ]);
  const [gridRowCount, setGridRowCount] = React.useState(2);
  const [rowTracks, setRowTracks] = React.useState([
    defaultRowTrack(),
    defaultRowTrack(),
  ]);
  const [columnGap, setColumnGap] = React.useState(16);
  const [rowGap, setRowGap] = React.useState(16);
  const [gridJustifyItems, setGridJustifyItems] = React.useState("stretch");
  const [gridAlignItems, setGridAlignItems] = React.useState("stretch");

  const [gap, setGap] = React.useState(12);
  const [numChildren, setNumChildren] = React.useState(4);
  const [childSize, setChildSize] = React.useState(72);
  const [copyLabel, setCopyLabel] = React.useState("Copy CSS");

  function syncColCount(next) {
    const c = clamp(Math.round(next), 1, 6);
    setGridColCount(c);
    setColTracks((prev) => {
      const arr = prev.slice(0, c);
      while (arr.length < c) arr.push(defaultColTrack());
      return arr;
    });
  }

  function syncRowCount(next) {
    const r = clamp(Math.round(next), 1, 4);
    setGridRowCount(r);
    setRowTracks((prev) => {
      const arr = prev.slice(0, r);
      while (arr.length < r) arr.push(defaultRowTrack());
      return arr;
    });
  }

  function updateColTrack(i, patch) {
    setColTracks((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  function updateRowTrack(i, patch) {
    setRowTracks((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  const gridTemplateColumns = React.useMemo(
    () => colTracks.slice(0, gridColCount).map(formatColTrack).join(" "),
    [colTracks, gridColCount]
  );

  const gridTemplateRows = React.useMemo(
    () => rowTracks.slice(0, gridRowCount).map(formatRowTrack).join(" "),
    [rowTracks, gridRowCount]
  );

  const previewStyle = React.useMemo(() => {
    if (layoutMode === "grid") {
      return {
        display: "grid",
        gridTemplateColumns,
        gridTemplateRows,
        columnGap: `${columnGap}px`,
        rowGap: `${rowGap}px`,
        justifyItems: gridJustifyItems,
        alignItems: gridAlignItems,
      };
    }
    return {
      display: "flex",
      flexDirection,
      justifyContent,
      alignItems,
      flexWrap,
      gap: `${gap}px`,
    };
  }, [
    layoutMode,
    gridTemplateColumns,
    gridTemplateRows,
    columnGap,
    rowGap,
    gridJustifyItems,
    gridAlignItems,
    flexDirection,
    justifyContent,
    alignItems,
    flexWrap,
    gap,
  ]);

  const cssOutput = React.useMemo(() => {
    if (layoutMode === "grid") {
      return `.grid {
  display: grid;
  grid-template-columns: ${gridTemplateColumns};
  grid-template-rows: ${gridTemplateRows};
  column-gap: ${columnGap}px;
  row-gap: ${rowGap}px;
  justify-items: ${gridJustifyItems};
  align-items: ${gridAlignItems};
}

.item {
  min-width: 0;
  min-height: 0;
}`;
    }

    return `.container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${gap}px;
}

.item {
  flex-shrink: 0;
  width: ${childSize}px;
  height: ${childSize}px;
}`;
  }, [
    layoutMode,
    gridTemplateColumns,
    gridTemplateRows,
    columnGap,
    rowGap,
    gridJustifyItems,
    gridAlignItems,
    flexDirection,
    justifyContent,
    alignItems,
    flexWrap,
    gap,
    childSize,
  ]);

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(cssOutput);
      setCopyLabel("Copied!");
      pushToast("Copied!");
      window.setTimeout(() => setCopyLabel("Copy CSS"), 1600);
    } catch {
      pushToast("Copy failed.");
    }
  }

  const panel =
    "rounded-xl border border-slate-200 bg-[#ffffff] p-4 shadow-sm dark:border-slate-500/35 dark:bg-[rgba(20,30,34,0.92)] dark:shadow-none";

  const flexCount = clamp(Math.round(numChildren), 1, 8);
  const gridCellCount = gridColCount * gridRowCount;

  const numberInputClass =
    "w-full max-w-[5rem] rounded-lg border border-slate-200 bg-[#f8fafc] px-2 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#3aafa9] dark:border-slate-500/50 dark:bg-[rgba(15,23,42,0.65)] dark:text-slate-100";

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <Helmet>
        <title>Flex & Grid Generator — DevToolbox</title>
        <meta
          name="description"
          content="Flexbox or CSS Grid with column/row tracks, gaps, live preview and copyable CSS."
        />
      </Helmet>

      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Flex & Grid Generator
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Choose Flex or Grid, tune properties on the left; preview and CSS update
          instantly.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className={`${panel} space-y-5`}>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Controls
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Layout mode
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "flex", label: "Flex" },
                { id: "grid", label: "Grid" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLayoutMode(id)}
                  className={
                    layoutMode === id
                      ? "dt-btn rounded-lg px-4 py-2 text-sm font-medium"
                      : "rounded-lg border border-slate-200 bg-[#f8fafc] px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-500/40 dark:bg-[rgba(15,23,42,0.5)] dark:text-slate-200 dark:hover:bg-[rgba(15,23,42,0.75)]"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {layoutMode === "flex" ? (
            <>
              <OptionButtonGroup
                label="flex-direction"
                value={flexDirection}
                options={FLEX_DIRECTION}
                onChange={setFlexDirection}
              />
              <OptionButtonGroup
                label="justify-content"
                value={justifyContent}
                options={JUSTIFY_CONTENT}
                onChange={setJustifyContent}
              />
              <OptionButtonGroup
                label="align-items"
                value={alignItems}
                options={ALIGN_ITEMS}
                onChange={setAlignItems}
              />
              <OptionButtonGroup
                label="flex-wrap"
                value={flexWrap}
                options={FLEX_WRAP}
                onChange={setFlexWrap}
              />
              <SliderRow
                label="gap"
                suffix="px"
                value={gap}
                min={0}
                max={48}
                step={1}
                onChange={(v) => setGap(clamp(v, 0, 48))}
              />
              <SliderRow
                label="Number of child boxes"
                value={numChildren}
                min={1}
                max={8}
                step={1}
                onChange={(v) =>
                  setNumChildren(clamp(Math.round(v), 1, 8))
                }
              />
              <SliderRow
                label="Each child box size (width & height)"
                suffix="px"
                value={childSize}
                min={40}
                max={120}
                step={1}
                onChange={(v) => setChildSize(clamp(v, 40, 120))}
              />
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  Columns (1–6)
                </div>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={gridColCount}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v)) syncColCount(v);
                  }}
                  className={numberInputClass}
                  aria-label="Number of columns"
                />
              </div>
              <div className="space-y-2">
                {Array.from({ length: gridColCount }, (_, i) => (
                  <ColTrackRow
                    key={i}
                    index={i}
                    track={colTracks[i] || defaultColTrack()}
                    onChange={(patch) => updateColTrack(i, patch)}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  Rows (1–4)
                </div>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={gridRowCount}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v)) syncRowCount(v);
                  }}
                  className={numberInputClass}
                  aria-label="Number of rows"
                />
              </div>
              <div className="space-y-2">
                {Array.from({ length: gridRowCount }, (_, i) => (
                  <RowTrackRow
                    key={i}
                    index={i}
                    track={rowTracks[i] || defaultRowTrack()}
                    onChange={(patch) => updateRowTrack(i, patch)}
                  />
                ))}
              </div>

              <SliderRow
                label="Column gap"
                suffix="px"
                value={columnGap}
                min={0}
                max={48}
                step={1}
                onChange={(v) => setColumnGap(clamp(v, 0, 48))}
              />
              <SliderRow
                label="Row gap"
                suffix="px"
                value={rowGap}
                min={0}
                max={48}
                step={1}
                onChange={(v) => setRowGap(clamp(v, 0, 48))}
              />
              <OptionButtonGroup
                label="justify-items"
                value={gridJustifyItems}
                options={GRID_PLACE_ITEMS}
                onChange={setGridJustifyItems}
              />
              <OptionButtonGroup
                label="align-items"
                value={gridAlignItems}
                options={GRID_PLACE_ITEMS}
                onChange={setGridAlignItems}
              />
              <SliderRow
                label="Cell content size (min)"
                suffix="px"
                value={childSize}
                min={40}
                max={120}
                step={1}
                onChange={(v) => setChildSize(clamp(v, 40, 120))}
              />
            </>
          )}
        </div>

        <div className={`${panel} space-y-3`}>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Live preview
          </div>
          <div
            className="min-h-[320px] w-full rounded-lg border border-dashed border-slate-300 bg-[#e8ecf0] p-4 dark:border-slate-500/50 dark:bg-[#0f1418]"
            style={previewStyle}
          >
            {Array.from(
              {
                length: layoutMode === "grid" ? gridCellCount : flexCount,
              },
              (_, i) => (
                <div
                  key={i}
                  className={
                    layoutMode === "flex"
                      ? "flex shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-md"
                      : "flex min-h-0 min-w-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-md"
                  }
                  style={
                    layoutMode === "grid"
                      ? {
                          minWidth: childSize,
                          minHeight: childSize,
                          width: "100%",
                          height: "100%",
                          backgroundColor:
                            PREVIEW_ITEM_COLORS[i % PREVIEW_ITEM_COLORS.length],
                        }
                      : {
                          width: childSize,
                          height: childSize,
                          backgroundColor:
                            PREVIEW_ITEM_COLORS[i % PREVIEW_ITEM_COLORS.length],
                        }
                  }
                >
                  {i + 1}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className={`${panel} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Generated CSS
          </div>
          <button
            type="button"
            onClick={copyCss}
            className="dt-btn rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3aafa9] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#263d42]"
          >
            {copyLabel}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-[#f1f5f9] p-3 font-mono text-xs text-slate-900 dark:border-slate-600/50 dark:bg-[rgba(8,12,16,0.95)] dark:text-[#e2e8f0]">
          <code>{cssOutput}</code>
        </pre>
      </div>
    </div>
  );
}
