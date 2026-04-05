"use client";

import { useId } from "react";
import Link from "next/link";
import { RiveMascot } from "@/components/rive-mascot";
import { cn } from "@/lib/utils";

type Props = {
  lessonId: number;
  levelOrder: number;
  levelName: string;
  levelDescription: string;
  completed: boolean;
  locked: boolean;
  active: boolean;
  percentage: number;
  isLast: boolean;
};

// ─── Brilliant-style 3D isometric disc node ───
const DiscNodeSVG = ({ state }: { state: "active" | "completed" | "locked" }) => {
  const uid = useId();
  const isGreen = state === "active" || state === "completed";
  const baseColor = isGreen ? "#6967fb" : "#AFAFAF";
  const darkColor = isGreen ? "#4a48d4" : "#999999";
  const midColor  = isGreen ? "#5a58e8" : "#A5A5A5";

  return (
    <svg viewBox="0 0 186 195" className="w-full h-full" style={{ overflow: "visible" }}>
      {/* ── Active: outer spinning loading ring ── */}
      {state === "active" && (
        <>
          {/* Subtle ring track */}
          <ellipse cx="93" cy="137" rx="96" ry="58" fill="none" stroke={baseColor} strokeWidth="8" opacity="0.12" />
          {/* Spinning dash segment */}
          <ellipse cx="93" cy="137" rx="96" ry="58" fill="none" stroke={baseColor} strokeWidth="8"
            strokeDasharray="90 400" strokeLinecap="round" opacity="0.65">
            <animate attributeName="stroke-dashoffset" from="0" to="-490" dur="2s" repeatCount="indefinite" />
          </ellipse>
          {/* Second dash for balanced look */}
          <ellipse cx="93" cy="137" rx="96" ry="58" fill="none" stroke={baseColor} strokeWidth="8"
            strokeDasharray="90 400" strokeLinecap="round" opacity="0.65">
            <animate attributeName="stroke-dashoffset" from="-245" to="-735" dur="2s" repeatCount="indefinite" />
          </ellipse>
        </>
      )}

      {/* ── 3D disc body (paths from Brilliant app) ── */}

      {/* 1. Shadow outline donut — creates 3D depth */}
      <path
        fillRule="evenodd" clipRule="evenodd"
        d="M131.025 149.242C109.966 161.892 75.8224 161.891 54.7634 149.242C33.704 136.592 33.704 116.083 54.7634 103.434C75.8224 90.7845 109.966 90.7844 131.025 103.434C152.084 116.084 152.084 136.592 131.025 149.242ZM140.3 163.281C114.119 178.805 71.6697 178.805 45.4881 163.281C19.3065 147.757 19.3065 122.587 45.4881 107.063C71.6697 91.5383 114.119 91.5383 140.3 107.063C166.482 122.587 166.482 147.757 140.3 163.281Z"
        fill="black" opacity="0.12"
      />

      {/* 2. Outer ring — dark shade for 3D side */}
      <path d="M140.3 163.281C114.119 178.805 71.6697 178.805 45.4881 163.281C19.3065 147.757 19.3065 122.587 45.4881 107.063C71.6697 91.5382 114.119 91.5382 140.3 107.063C166.482 122.587 166.482 147.757 140.3 163.281Z" fill={darkColor} />

      {/* 3. Inner disc — lighter top surface */}
      <path d="M54.7632 149.242C75.8222 161.892 109.966 161.892 131.025 149.242C152.084 136.593 152.084 116.084 131.025 103.435C109.966 90.785 75.8222 90.7852 54.7632 103.435C33.7039 116.084 33.7039 136.593 54.7632 149.242Z" fill={baseColor} />
      <path d="M54.7632 149.242C75.8222 161.892 109.966 161.892 131.025 149.242C152.084 136.593 152.084 116.084 131.025 103.435C109.966 90.785 75.8222 90.7852 54.7632 103.435C33.7039 116.084 33.7039 136.593 54.7632 149.242Z" fill="white" fillOpacity="0.75" />

      {/* 4. Outer ring — colored top surface */}
      <path d="M140.3 163.281C114.119 178.805 71.6697 178.805 45.4881 163.281C19.3065 147.757 19.3065 122.587 45.4881 107.063C71.6697 91.5382 114.119 91.5382 140.3 107.063C166.482 122.587 166.482 147.757 140.3 163.281Z" fill={midColor} />

      {/* 5. Highlight — white triangle light on ring */}
      <mask id={`${uid}-h`} style={{ maskType: "luminance" } as React.CSSProperties} maskUnits="userSpaceOnUse" x="25" y="95" width="135" height="80">
        <path d="M140.3 163.282C114.118 178.805 71.6697 178.805 45.4882 163.282C19.3067 147.757 19.3067 122.588 45.4882 107.063C71.6697 91.5386 114.118 91.5386 140.3 107.063C166.481 122.588 166.481 149.866 140.3 163.282Z" fill="white" />
      </mask>
      <g mask={`url(#${uid}-h)`}>
        <path d="M92.89 88.06L162.85 182.29H22.94L92.89 88.06Z" fill="white" fillOpacity="0.2" />
      </g>

      {/* 6. Inner disc — shading within */}
      <mask id={`${uid}-i`} style={{ maskType: "luminance" } as React.CSSProperties} maskUnits="userSpaceOnUse" x="38" y="93" width="109" height="66">
        <path d="M131.025 149.242C109.966 161.892 75.8223 161.892 54.7633 149.242C33.7041 136.592 33.7041 116.084 54.7633 103.434C75.8223 90.785 109.966 90.785 131.025 103.434C152.084 116.084 152.084 136.592 131.025 149.242Z" fill="white" />
      </mask>
      <g mask={`url(#${uid}-i)`}>
        <rect x="25" y="93" width="135" height="66" fill={baseColor} />
        <rect x="25" y="93" width="135" height="66" fill="white" fillOpacity="0.75" />
      </g>

      {/* 7. White center ellipse */}
      <path d="M61.9771 108.64C79.052 98.866 106.736 98.866 123.811 108.64C140.886 118.414 140.886 134.262 123.811 144.037C106.736 153.811 79.052 153.811 61.9771 144.037C44.9022 134.262 44.9022 118.414 61.9771 108.64Z" fill="white" />

      {/* 8–9. Center detail (only for locked/completed — active gets pure white + glow) */}
      {state !== "active" && (
        <>
          <mask id={`${uid}-c`} style={{ maskType: "luminance" } as React.CSSProperties} maskUnits="userSpaceOnUse" x="49" y="101" width="88" height="51">
            <path d="M61.9772 108.64C79.0521 98.865 106.736 98.865 123.811 108.64C140.886 118.414 140.886 134.262 123.811 144.036C106.736 153.811 79.0521 153.811 61.9772 144.036C44.9023 134.262 44.9023 118.414 61.9772 108.64Z" fill="white" />
          </mask>
          <g mask={`url(#${uid}-c)`}>
            <rect x="46" y="101" width="44" height="51" fill={baseColor} fillOpacity="0.06" />
            <rect x="89" y="101" width="48" height="51" fill={baseColor} fillOpacity="0.06" />
            <path d="M116.57 139.901C103.396 147.376 82.0377 147.376 68.8642 139.901C55.6908 132.427 55.6908 120.308 68.8642 112.833C82.0377 105.359 103.396 105.359 116.57 112.833C129.743 120.308 129.743 132.427 116.57 139.901Z" fill={baseColor} fillOpacity="0.06" />
          </g>

          <mask id={`${uid}-e`} style={{ maskType: "luminance" } as React.CSSProperties} maskUnits="userSpaceOnUse" x="49" y="101" width="88" height="51">
            <path d="M95.92 151.37C103.91 151.37 121.82 148.13 131.12 138.73C138.41 131.36 138.49 121.54 131.12 114.1C122.95 105.84 106.58 101.42 95.9 101.42V107.3C100.7 107.3 110.6 109.35 116.69 112.83C129.64 120.32 129.64 132.44 116.69 139.9C110.89 143.21 100.2 145.43 95.9 145.43L95.92 151.37ZM89.85 151.37C81.85 151.37 63.95 148.13 54.64 138.73C47.35 131.36 47.28 121.54 54.64 114.1C62.82 105.84 79.18 101.42 89.86 101.42V107.3C85.85 107.3 75.16 109.36 69.07 112.83C55.98 120.31 55.98 132.43 69.07 139.9C74.87 143.22 85.17 145.44 89.86 145.44L89.85 151.37Z" fill="white" />
          </mask>
          <g mask={`url(#${uid}-e)`}>
            <path d="M61.977 108.7C79.052 98.924 106.736 98.924 123.811 108.7C140.886 118.472 140.886 134.32 123.811 144.095C106.736 153.869 79.052 153.869 61.977 144.095C44.902 134.32 44.902 118.472 61.977 108.7Z" fill={baseColor} fillOpacity="0.25" />
            <path d="M61.977 108.7C79.052 98.924 106.736 98.924 123.811 108.7C140.886 118.472 140.886 134.32 123.811 144.095C106.736 153.869 79.052 153.869 61.977 144.095C44.902 134.32 44.902 118.472 61.977 108.7Z" fill="white" fillOpacity="0.5" />
          </g>
        </>
      )}

      {/* Active: pure white center + vertical light beam shooting upward */}
      {state === "active" && (
        <>
          {/* Solid white center (fully opaque) */}
          <path d="M61.9771 108.64C79.052 98.866 106.736 98.866 123.811 108.64C140.886 118.414 140.886 134.262 123.811 144.037C106.736 153.811 79.052 153.811 61.9771 144.037C44.9022 134.262 44.9022 118.414 61.9771 108.64Z" fill="white" />
        </>
      )}

      {/* 10. Completed — Brilliant checkmark in center */}
      {state === "completed" && (
        <>
          {/* Checkmark masked within center ellipse */}
          <mask id={`${uid}-chk`} style={{ maskType: "luminance" } as React.CSSProperties} maskUnits="userSpaceOnUse" x="48" y="103" width="90" height="51">
            <path d="M61.8163 110.969C79.062 101.196 107.022 101.196 124.268 110.969C141.514 120.741 141.514 136.586 124.268 146.358C107.022 156.131 79.062 156.131 61.8163 146.358C44.5707 136.586 44.5707 120.741 61.8163 110.969Z" fill="white" />
          </mask>
          <g mask={`url(#${uid}-chk)`}>
            <path d="M104.942 122.956L102.056 120.772L89.9368 129.999L84.7426 126.155L81.8569 128.123L89.9368 134.152L104.942 122.956Z" fill={baseColor} />
          </g>
        </>
      )}
    </svg>
  );
};

// ─── Brilliant-style star/badge node for last level ───
const StarNodeSVG = ({ state }: { state: "active" | "completed" | "locked" }) => {
  const uid = useId();
  const isGreen = state === "active" || state === "completed";
  const baseColor = isGreen ? "#6967fb" : "#CCCCCC";
  const darkColor = isGreen ? "#4a48d4" : "#999999";
  const surfaceColor = isGreen ? "#d0cfff" : "#E5E5E5";
  const ringColor = isGreen ? "#6967fb" : "#CCCCCC";

  return (
    <svg viewBox="0 0 120 117" className="w-full h-full" style={{ overflow: "visible" }}>
      {/* Active: spinning ring around star */}
      {state === "active" && (
        <>
          <ellipse cx="60" cy="80" rx="58" ry="32" fill="none" stroke={baseColor} strokeWidth="5" opacity="0.12" />
          <ellipse cx="60" cy="80" rx="58" ry="32" fill="none" stroke={baseColor} strokeWidth="5"
            strokeDasharray="55 230" strokeLinecap="round" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="0" to="-285" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="60" cy="80" rx="58" ry="32" fill="none" stroke={baseColor} strokeWidth="5"
            strokeDasharray="55 230" strokeLinecap="round" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="-142" to="-427" dur="2s" repeatCount="indefinite" />
          </ellipse>
        </>
      )}

      {/* 3D shadow base */}
      <path d="M92.961 59.1426L89.8008 56.8008H59.9688H30.2031L27.0401 59.1426C25.0982 60.5645 23.7338 62.6389 23.1983 64.9853L21.9932 70.2656C21.7896 70.9181 21.387 71.545 20.8037 72.1162L15.7061 77.1074C13.9156 78.8609 13.9158 81.0375 15.7061 82.791L20.8037 87.7832C21.387 88.3543 21.7896 88.9813 21.9932 89.6338L24.0283 96.1572C24.7542 98.4842 27.9357 100.297 31.9756 100.686L42.6758 101.715C44.1837 101.86 45.6111 102.209 46.8409 102.733L54.2774 105.903C55.9369 106.611 58.0045 106.974 59.9688 106.995V106.997C59.9792 106.997 59.9896 106.996 60 106.996C60.0106 106.996 60.0217 106.997 60.0323 106.997V106.995C61.9962 106.974 64.0634 106.611 65.7227 105.903L73.1592 102.733C74.389 102.209 75.8163 101.86 77.3242 101.715L88.0254 100.686C92.0651 100.297 95.2459 98.4841 95.9717 96.1572L98.0069 89.6338C98.2104 88.9813 98.6131 88.3543 99.1963 87.7832L104.294 82.791C106.084 81.0375 106.085 78.8609 104.294 77.1074L99.1963 72.1162C98.6131 71.545 98.2104 70.9181 98.0069 70.2656L96.8018 64.9853C96.2663 62.639 94.9026 60.5645 92.961 59.1426Z" fill={darkColor} />

      {/* Shadow highlights */}
      <g opacity="0.15">
        <path d="M47.8721 90.21L44.2373 101.953C43.7199 101.849 43.1865 101.77 42.6426 101.718L31.9414 100.688C29.7467 100.476 27.8067 99.8433 26.375 98.9375L31.6377 88.0586L47.8721 90.21Z" fill="white" />
        <path d="M93.627 98.9385C92.1954 99.8436 90.2563 100.476 88.0625 100.688L77.3613 101.718C76.8164 101.77 76.282 101.849 75.7637 101.953L72.1299 90.21L88.3643 88.0586L93.627 98.9385Z" fill="white" />
      </g>

      {/* Star shape */}
      <path d="M89.7969 56.7994L93.1452 66.5535L101.139 74.0011L93.1452 81.4487L89.7969 91.2029L72.9008 92.9812L60 98.3281L47.0992 92.9812L30.2031 91.2029L26.8548 81.4487L18.8609 74.0011L26.8548 66.5535L30.2031 56.7994L47.0992 55.021L60 49.6742L72.9008 55.021L89.7969 56.7994Z" fill={surfaceColor} />

      {/* Inner details — masked within star shape */}
      <mask id={`${uid}-s`} style={{ maskType: "alpha" } as React.CSSProperties} maskUnits="userSpaceOnUse" x="18" y="49" width="84" height="50">
        <path d="M89.7969 56.7994L93.1452 66.5535L101.139 74.0011L93.1452 81.4487L89.7969 91.2029L72.9008 92.9812L60 98.3281L47.0992 92.9812L30.2031 91.2029L26.8548 81.4487L18.8609 74.0011L26.8548 66.5535L30.2031 56.7994L47.0992 55.021L60 49.6742L72.9008 55.021L89.7969 56.7994Z" fill="white" />
      </mask>
      <g mask={`url(#${uid}-s)`}>
        {/* Inner isometric ring */}
        <path d="M33.8371 89.5563C48.2864 98.1479 71.7136 98.1479 86.163 89.5563C100.612 80.9648 100.612 67.0352 86.163 58.4437C71.7136 49.8521 48.2864 49.8521 33.8371 58.4437C19.3877 67.0352 19.3877 80.9648 33.8371 89.5563Z" fill={surfaceColor} />

        {/* White center */}
        <path d="M38.7868 61.9792C50.5025 55.3403 69.4975 55.3403 81.2132 61.9792C92.9289 68.6181 92.9289 79.3819 81.2132 86.0208C69.4975 92.6597 50.5025 92.6597 38.7868 86.0208C27.0711 79.3819 27.0711 68.6181 38.7868 61.9792Z" fill="white" />

        {/* Center shading */}
        <mask id={`${uid}-sc`} style={{ maskType: "alpha" } as React.CSSProperties} maskUnits="userSpaceOnUse" x="23" y="52" width="74" height="44">
          <path d="M33.8371 89.5563C48.2864 98.1479 71.7136 98.1479 86.163 89.5563C100.612 80.9648 100.612 67.0352 86.163 58.4437C71.7136 49.8521 48.2864 49.8521 33.8371 58.4437C19.3877 67.0352 19.3877 80.9648 33.8371 89.5563Z" fill="white" />
        </mask>
        <g mask={`url(#${uid}-sc)`}>
          {/* Left half shade */}
          <path d="M58 52.0312C49.2081 52.3125 40.5527 54.4483 33.8369 58.4414C19.3876 67.0329 19.3876 80.9632 33.8369 89.5547C40.5527 93.5479 49.2081 95.6826 58 95.9639V86.9463C52.797 86.6911 47.7181 85.441 43.7363 83.1904C34.7545 78.1136 34.7545 69.8825 43.7363 64.8057C47.7182 62.5551 52.797 61.304 58 61.0488V52.0312Z" fill={ringColor} fillOpacity="0.25" />
          {/* Right half shade */}
          <path d="M62 52.0312C70.7919 52.3125 79.4473 54.4483 86.1631 58.4414C100.612 67.0329 100.612 80.9632 86.1631 89.5547C79.4473 93.5479 70.7919 95.6826 62 95.9639V86.9463C67.203 86.6911 72.2819 85.441 76.2637 83.1904C85.2455 78.1136 85.2455 69.8825 76.2637 64.8057C72.2818 62.5551 67.203 61.304 62 61.0488V52.0312Z" fill={ringColor} fillOpacity="0.25" />
          {/* Inner ring */}
          <path d="M76.2635 83.1924C67.2814 88.2692 52.7186 88.2692 43.7365 83.1924C34.7545 78.1156 34.7545 69.8844 43.7365 64.8076C52.7186 59.7308 67.2814 59.7308 76.2635 64.8076C85.2455 69.8844 85.2455 78.1156 76.2635 83.1924Z" fill={isGreen ? "#E5E5E5" : surfaceColor} />
        </g>
      </g>

      {/* Star outline ring */}
      <path
        fillRule="evenodd" clipRule="evenodd"
        d="M86.1631 58.4434C71.7137 49.8519 48.2863 49.8519 33.8369 58.4434C19.3875 67.0349 19.3875 80.9651 33.8369 89.5566C48.2863 98.1482 71.7137 98.1482 86.1631 89.5566C100.612 80.9651 100.612 67.0349 86.1631 58.4434ZM38.7871 61.9795C50.5028 55.3407 69.4972 55.3407 81.2129 61.9795C92.9286 68.6184 92.9286 79.3816 81.2129 86.0205C69.4972 92.6594 50.5028 92.6594 38.7871 86.0205C27.0714 79.3816 27.0714 68.6184 38.7871 61.9795Z"
        fill={ringColor} fillOpacity="0.15"
      />

      {/* Completed — checkmark in center */}
      {state === "completed" && (
        <g transform="translate(48, 62)">
          <path d="M17.5 6.5L15.2 4.7L8 11.1L5.8 9.2L4 10.5L8 13.4L17.5 6.5Z" fill={baseColor} />
        </g>
      )}
    </svg>
  );
};

// ─── Node wrapper — delegates to disc or star ───
const NodeSVG = ({ state, isLast }: { state: "active" | "completed" | "locked"; isLast: boolean }) => {
  if (isLast) {
    return <StarNodeSVG state={state} />;
  }
  return <DiscNodeSVG state={state} />;
};

export const LevelCard = ({
  lessonId,
  levelOrder,
  levelName,
  levelDescription,
  completed,
  locked,
  active,
  percentage,
  isLast,
}: Props) => {
  const href = `/lesson/${lessonId}`;
  const state = completed ? "completed" : active ? "active" : "locked";

  const content = (
    <div className="flex items-center justify-center gap-3 sm:gap-5 w-full group">
      <div className="flex flex-col items-center shrink-0" style={{ overflow: "visible" }}>
        <div className={cn(
          "relative w-[100px] sm:w-[120px]",
          active ? "h-[105px] sm:h-[120px]" : "h-[75px] sm:h-[88px]"
        )} style={{ overflow: "visible" }}>
          <NodeSVG state={state} isLast={isLast} />

          {active && (
            <>
              {/* Mascot — tripled size vs. the original SVG mascot */}
              <div
                className={cn(
                  "absolute z-10 pointer-events-none",
                  isLast
                    ? "w-[9rem] h-[7.5rem] sm:w-[10.5rem] sm:h-[9rem]"
                    : "w-[10.5rem] h-[9rem] sm:w-[12rem] sm:h-[10.5rem]"
                )}
                style={{
                  // Position the mascot so its feet visually rest on
                  // the platform disc. The box is tall (x3 vs. the
                  // original) but the figure is concentrated in the
                  // upper portion, so we pull `top` down until the
                  // body sits right on top of the disc.
                  top: isLast ? "-30px" : "-35px",
                  left: "50%",
                  animation: "mascotFloat 2.5s ease-in-out infinite",
                }}
              >
                <RiveMascot
                  src="/animations/mascot_breath.riv"
                  animationName="breath loop"
                />
              </div>

              {/* White glow — same width as disc center, touches bottom of mascot */}
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: isLast ? "22px" : "28px",
                  width: isLast ? "50px" : "60px",
                  height: isLast ? "34px" : "40px",
                  background: "linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)",
                  borderRadius: "50%",
                  filter: "blur(8px)",
                  animation: "glowPulse 2.5s ease-in-out infinite",
                }}
              />
            </>
          )}
        </div>
      </div>

      <div className="min-w-0 max-w-[14rem]">
        <p className={cn(
          "text-base sm:text-lg font-bold leading-tight",
          completed && "text-brilliant-text",
          active && "text-brilliant-text",
          locked && "text-brilliant-muted"
        )}>
          {levelName}
        </p>
        <p className={cn(
          "text-xs sm:text-sm mt-0.5 leading-snug",
          completed && "text-brilliant-muted",
          active && "text-brilliant-muted",
          locked && "text-brilliant-muted/60"
        )}>
          {levelDescription}
        </p>

        {active && percentage > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="w-20 h-[5px] bg-brilliant-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brilliant-green rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-brilliant-green">{percentage}%</span>
          </div>
        )}
        {completed && (
          <p className="text-xs font-semibold text-brilliant-green mt-1">Complété ✓</p>
        )}
      </div>
    </div>
  );

  if (locked) {
    return <div className="w-full cursor-not-allowed py-2 sm:py-3">{content}</div>;
  }

  return (
    <Link href={href} className="w-full hover:opacity-90 transition py-2 sm:py-3 block">
      {content}
    </Link>
  );
};
