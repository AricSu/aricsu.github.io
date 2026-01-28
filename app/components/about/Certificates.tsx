import { useEffect, useMemo, useRef, useState } from "react";

export type CertificateColorOption = {
  name: string;
  hex: string;
  img?: string;
};
export type CertificateGroupDetail = {
  title?: string;
  desc?: string;
  img?: string;
  colors?: CertificateColorOption[];
};
export type CertificateGroup = {
  label: string;
  image: string;
  detail?: CertificateGroupDetail;
};

const defaultGroups: CertificateGroup[] = [
  {
    label: "PingCAP TiDB",
    image: "/images/hero/ptca.jpg",
    detail: {
      title: "Certificates",
      desc: "Choose a certificate variant.",
      colors: [
        { name: "PTCA", hex: "#A3C1DA", img: "/images/hero/ptca.jpg" },
        {
          name: "PTCP (EN)",
          hex: "#222222",
          img: "/images/hero/ptcp_english.jpg",
        },
        {
          name: "PCTP (ZH)",
          hex: "#F5F5F7",
          img: "/images/hero/pctp_chinese.jpg",
        },
        { name: "PGCA", hex: "#E3D9C6", img: "/images/hero/pgca.jpg" },
      ],
    },
  },
  {
    label: "PGCE",
    image: "/images/hero/pgce.jpg",
    detail: {
      title: "PGCE",
      desc: "PingCAP Certified TiDB Enterprise (example).",
    },
  },
  {
    label: "Oracle OCP",
    image: "/images/hero/OCP.jpg",
    detail: {
      title: "Oracle OCP",
      desc: "Oracle Certified Professional.",
    },
  },
  {
    label: "MVA",
    image: "/images/hero/mva.jpg",
    detail: {
      title: "MVA",
      desc: "Microsoft Virtual Academy (example).",
    },
  },
];

export function Certificates({
  groups = defaultGroups,
}: {
  groups?: CertificateGroup[];
}) {
  const [currentGroup, setCurrentGroup] = useState(0);
  const [currentColorIdx, setCurrentColorIdx] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const navTimeoutRef = useRef<number | null>(null);

  const activeGroup = groups[currentGroup];
  const activeColors = activeGroup?.detail?.colors;
  const activeImage = useMemo(() => {
    if (activeColors) {
      return activeColors[currentColorIdx]?.img || activeGroup?.image || "";
    }
    return activeGroup?.image || "";
  }, [activeColors, activeGroup?.image, currentColorIdx]);

  useEffect(() => {
    return () => {
      if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current);
    };
  }, []);

  function selectGroup(idx: number) {
    setCurrentGroup(idx);
    if (groups[idx]?.detail?.colors) setCurrentColorIdx(0);

    if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = window.setTimeout(() => {
      setShowNav(true);
    }, 350);
  }

  function selectColor(idx: number) {
    setCurrentColorIdx(idx);
  }

  return (
    <section
      className="w-full max-w-[1100px] mx-auto my-12 rounded-3xl overflow-hidden bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)] flex items-stretch max-[900px]:flex-col max-[900px]:my-6 max-[900px]:rounded-2xl"
      aria-label="Certificates"
    >
      {/* Desktop sidebar */}
      <div className="flex flex-row items-center gap-4 p-6 w-[340px] min-w-[340px] max-[900px]:hidden">
        <div
          className={`flex flex-col items-center justify-center gap-4 ${showNav ? "visible" : "invisible"}`}
        >
          <button
            type="button"
            className="w-11 h-11 rounded-full bg-[#f6f7fa] shadow-[0_2px_16px_rgba(0,0,0,0.04)] flex items-center justify-center transition-colors transition-shadow disabled:opacity-45 disabled:cursor-not-allowed"
            aria-label="Previous group"
            disabled={currentGroup === 0}
            onClick={() => selectGroup(currentGroup - 1)}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Previous</title>
              <circle cx="14" cy="14" r="13" fill="#f6f7fa" />
              <path
                d="M9 16L14 11L19 16"
                stroke="#888"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            className="w-11 h-11 rounded-full bg-[#f6f7fa] shadow-[0_2px_16px_rgba(0,0,0,0.04)] flex items-center justify-center transition-colors transition-shadow disabled:opacity-45 disabled:cursor-not-allowed"
            aria-label="Next group"
            disabled={currentGroup === groups.length - 1}
            onClick={() => selectGroup(currentGroup + 1)}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Next</title>
              <circle cx="14" cy="14" r="13" fill="#f6f7fa" />
              <path
                d="M9 12L14 17L19 12"
                stroke="#222"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 justify-center w-full">
          {groups.map((group, idx) => (
            <div key={group.label} className="flex flex-col">
              {idx !== currentGroup ? (
                <button
                  type="button"
                  className="w-full inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#f5f5f7] to-[#f4f5f7] text-base font-medium text-[#222] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:from-[#eaf2fb] hover:to-[#f5f5f7] hover:text-[#0071e3] hover:shadow-[0_10px_28px_rgba(0,113,227,0.12)] hover:-translate-y-[1px]"
                  aria-label={group.label}
                  onClick={() => {
                    selectGroup(idx);
                    setShowNav(true);
                  }}
                >
                  {idx === 0 ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#222] shrink-0" />
                  ) : (
                    <span className="text-[1.4rem] leading-none shrink-0">
                      +
                    </span>
                  )}
                  <span>{group.label}</span>
                </button>
              ) : group.detail?.desc ? (
                <div className="bg-[#f4f5f7] rounded-2xl shadow-[0_2px_18px_rgba(0,0,0,0.07)] p-4 text-[#222] text-[0.95rem] flex flex-col gap-2.5">
                  {group.detail.colors ? (
                    <div>
                      <div className="font-bold text-[1.05rem]">
                        {group.detail.title ?? "Details"}
                      </div>
                      <div className="text-[#222] leading-relaxed">
                        {group.detail.desc}
                        <br />
                        Shown in{" "}
                        <b>{group.detail.colors[currentColorIdx]?.name}</b>.
                      </div>
                      <div className="flex gap-3 mt-3 justify-start">
                        {group.detail.colors.map((color, cidx) => (
                          <button
                            key={color.name}
                            type="button"
                            aria-label={color.name}
                            className={`w-[18px] h-[18px] rounded-full border-2 border-[#eaeaea] shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition ${
                              cidx === currentColorIdx
                                ? "border-[#0071e3] ring-2 ring-white"
                                : ""
                            }`}
                            style={{ background: color.hex }}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectColor(cidx);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {group.detail.title ? (
                        <div className="font-bold text-[1.05rem]">
                          {group.detail.title}
                        </div>
                      ) : null}
                      <div className="text-[#222] leading-relaxed">
                        {group.detail.desc}
                      </div>
                      {group.detail.img ? (
                        <img
                          src={group.detail.img}
                          className="w-full rounded-xl mt-2 object-cover"
                          alt="detail"
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 relative flex items-center justify-center p-6 max-[900px]:p-0">
        <img
          src={activeImage}
          className="w-full max-w-[560px] max-h-[520px] h-auto object-contain rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.18)] bg-white border border-black/10 block max-[900px]:max-w-full max-[900px]:max-h-[420px] max-[900px]:rounded-none max-[900px]:shadow-none max-[900px]:border-0"
          alt="Certificate preview"
        />

        {currentGroup > 0 ? (
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 left-3 w-11 h-11 rounded-full bg-[#f6f7fa] shadow-[0_2px_16px_rgba(0,0,0,0.08)] flex items-center justify-center z-10 transition-colors transition-shadow min-[901px]:hidden"
            aria-label="Previous group"
            onClick={() => selectGroup(currentGroup - 1)}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Previous</title>
              <circle cx="14" cy="14" r="13" fill="#f6f7fa" />
              <path
                d="M17 9L12 14L17 19"
                stroke="#888"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}

        {currentGroup < groups.length - 1 ? (
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 right-3 w-11 h-11 rounded-full bg-[#f6f7fa] shadow-[0_2px_16px_rgba(0,0,0,0.08)] flex items-center justify-center z-10 transition-colors transition-shadow min-[901px]:hidden"
            aria-label="Next group"
            onClick={() => selectGroup(currentGroup + 1)}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Next</title>
              <circle cx="14" cy="14" r="13" fill="#f6f7fa" />
              <path
                d="M11 9L16 14L11 19"
                stroke="#222"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Mobile bottom bar */}
      <div
        className="p-4 bg-white/90 border-t border-black/10 backdrop-blur-xl min-[901px]:hidden"
        data-testid="mobile-bottom-bar"
      >
        <div className="flex flex-col gap-2">
          {activeGroup?.detail?.colors ? (
            <>
              {activeGroup.detail.title ? (
                <div className="font-bold text-[1.05rem]">
                  {activeGroup.detail.title}
                </div>
              ) : null}
              {activeGroup.detail.desc ? (
                <div className="text-[#222] leading-relaxed">
                  {activeGroup.detail.desc}
                </div>
              ) : null}
              <div className="flex gap-3 mt-2 justify-center">
                {activeGroup.detail.colors.map((color, cidx) => (
                  <button
                    key={color.name}
                    type="button"
                    aria-label={color.name}
                    className={`w-7 h-7 rounded-full border-2 border-[#eaeaea] shadow-[0_2px_14px_rgba(0,0,0,0.08)] transition ${
                      cidx === currentColorIdx
                        ? "border-[#222] ring-2 ring-white"
                        : ""
                    }`}
                    style={{ background: color.hex }}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectColor(cidx);
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              {activeGroup?.detail?.title ? (
                <div className="font-bold text-[1.05rem]">
                  {activeGroup.detail.title}
                </div>
              ) : null}
              {activeGroup?.detail?.desc ? (
                <div className="text-[#222] leading-relaxed">
                  {activeGroup.detail.desc}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
