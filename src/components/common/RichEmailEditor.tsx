import React, { useState } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Quote, 
  Palette, 
  Sparkles,
  Check
} from "lucide-react";

interface RichEmailEditorProps {
  value: string;
  onChange: (htmlValue: string) => void;
  placeholder?: string;
}

export default function RichEmailEditor({
  value,
  onChange,
  placeholder = "Write your detailed email message here...",
}: RichEmailEditorProps) {
  const [selectedColor, setSelectedColor] = useState("#334155");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");

  // Quick insertion helpers
  const insertTag = (openTag: string, closeTag: string, defaultText: string = "text") => {
    const formatted = `${value}\n${openTag}${defaultText}${closeTag}`;
    onChange(formatted);
  };

  const insertHeading = (level: number) => {
    const tag = `h${level}`;
    const headingHtml = `<${tag} style="color: #0f172a; font-size: ${level === 1 ? '20px' : level === 2 ? '17px' : '15px'}; font-weight: 700; margin: 16px 0 8px 0;">Heading ${level}</${tag}>`;
    onChange(`${value}\n${headingHtml}`);
  };

  const insertGreenCallout = () => {
    const calloutHtml = `<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; border-radius: 6px; color: #065f46; font-size: 14px;"><strong>Important Note:</strong> We look forward to discussing the technical scope and timeline with you.</div>`;
    onChange(`${value}\n${calloutHtml}`);
  };

  const insertButton = () => {
    const btnHtml = `<div style="margin: 20px 0;"><a href="https://shakibul-islam-portofolio.vercel.app" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: 600; font-size: 14px;">Schedule Technical Meeting &rarr;</a></div>`;
    onChange(`${value}\n${btnHtml}`);
  };

  const handleApplyLink = () => {
    if (!linkUrl) return;
    const text = linkText.trim() || linkUrl;
    const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">${text}</a>`;
    onChange(`${value} ${linkHtml}`);
    setShowLinkModal(false);
    setLinkUrl("https://");
    setLinkText("");
  };

  const applyColor = (colorHex: string) => {
    setSelectedColor(colorHex);
    setShowColorPicker(false);
    const coloredHtml = `<span style="color: ${colorHex}; font-weight: 600;">colored text</span>`;
    onChange(`${value} ${coloredHtml}`);
  };

  const colorPalette = [
    { name: "Default Slate", hex: "#334155" },
    { name: "Indigo Blue", hex: "#4f46e5" },
    { name: "Cyan Teal", hex: "#0891b2" },
    { name: "Emerald Green", hex: "#059669" },
    { name: "Amber Orange", hex: "#d97706" },
    { name: "Rose Crimson", hex: "#e11d48" },
    { name: "Purple", hex: "#7e22ce" },
  ];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      {/* Toolbar */}
      <div className="bg-slate-50/80 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => insertTag("<strong>", "</strong>", "bold text")}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
          title="Bold"
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => insertTag("<em>", "</em>", "italicized text")}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
          title="Italic"
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => insertTag("<u>", "</u>", "underlined text")}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
          title="Underline"
        >
          <Underline size={16} />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => insertHeading(1)}
          className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200/70 transition-colors"
          title="Heading 1"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() => insertHeading(2)}
          className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200/70 transition-colors"
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => insertHeading(3)}
          className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200/70 transition-colors"
          title="Heading 3"
        >
          H3
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() =>
            insertTag(
              '<ul style="margin: 8px 0; padding-left: 20px; color: #334155;">\n  <li>',
              "</li>\n  <li>Second key point</li>\n</ul>",
              "First key point"
            )
          }
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
          title="Bullet List"
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() =>
            insertTag(
              '<ol style="margin: 8px 0; padding-left: 20px; color: #334155;">\n  <li>',
              "</li>\n  <li>Step two</li>\n</ol>",
              "Step one"
            )
          }
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Green highlight callout */}
        <button
          type="button"
          onClick={insertGreenCallout}
          className="px-2 py-1 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1"
          title="Insert Green Callout Line"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Green Callout</span>
        </button>

        {/* Button link */}
        <button
          type="button"
          onClick={insertButton}
          className="px-2 py-1 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          title="Insert CTA Button"
        >
          + CTA Button
        </button>

        {/* Link Button */}
        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
          title="Insert Hyperlink"
        >
          <LinkIcon size={16} />
        </button>

        {/* Color Picker Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center gap-1"
            title="Text Color"
          >
            <Palette size={16} style={{ color: selectedColor }} />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-xl shadow-lg border border-slate-200 z-50 flex flex-col gap-1 w-44">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Select Color
              </span>
              {colorPalette.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => applyColor(c.hex)}
                  className="flex items-center justify-between px-2 py-1 text-xs rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-slate-700">{c.name}</span>
                  </span>
                  {selectedColor === c.hex && <Check size={12} className="text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Text Area (HTML & Text supported) */}
      <div className="relative">
        <textarea
          rows={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 text-sm text-slate-800 focus:outline-hidden font-mono resize-y leading-relaxed bg-white"
        />
      </div>

      {/* Link Dialog Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Insert Hyperlink</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Anchor Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schedule Call"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  URL Address
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyLink}
                  className="px-4 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold shadow-xs"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
