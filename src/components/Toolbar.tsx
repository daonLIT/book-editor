interface ToolbarButton {
  label: string;
  command: string;
  icon: string;
  shortcut: string;
}

const BUTTONS: ToolbarButton[] = [
  { label: '굵게', command: 'bold', icon: 'B', shortcut: 'Ctrl+B' },
  { label: '기울임', command: 'italic', icon: 'I', shortcut: 'Ctrl+I' },
  { label: '밑줄', command: 'underline', icon: 'U', shortcut: 'Ctrl+U' },
];

export default function Toolbar() {
  function applyFormat(command: string) {
    document.execCommand(command, false);
  }

  return (
    <div className="no-print flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white">
      {BUTTONS.map((btn) => (
        <button
          key={btn.command}
          title={`${btn.label} (${btn.shortcut})`}
          onMouseDown={(e) => {
            // mousedown에서 처리해야 에디터 포커스가 유지됨
            e.preventDefault();
            applyFormat(btn.command);
          }}
          className={`
            w-8 h-8 rounded text-sm font-medium transition-colors
            hover:bg-gray-100 active:bg-gray-200 text-gray-700
            ${btn.command === 'bold' ? 'font-bold' : ''}
            ${btn.command === 'italic' ? 'italic' : ''}
            ${btn.command === 'underline' ? 'underline' : ''}
          `}
        >
          {btn.icon}
        </button>
      ))}
      <div className="w-px h-5 bg-gray-200 mx-1" />
      {/* 단락 형식 */}
      <select
        title="단락 형식"
        className="text-xs text-gray-600 border border-gray-200 rounded px-2 py-1 focus:outline-none hover:border-gray-300"
        onChange={(e) => {
          document.execCommand('formatBlock', false, e.target.value);
          e.target.value = 'p'; // 선택 초기화
        }}
        defaultValue="p"
      >
        <option value="p">본문</option>
        <option value="h1">제목 1</option>
        <option value="h2">제목 2</option>
        <option value="h3">제목 3</option>
      </select>
    </div>
  );
}
