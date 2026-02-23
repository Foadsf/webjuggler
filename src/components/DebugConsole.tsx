import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Download, 
  Filter,
  Search,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Zap
} from 'lucide-react';
import { logger, LogEntry, LogLevel } from '../lib/logger';
import { cn } from '../lib/utils';

export function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [filterSource, setFilterSource] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs(logger.getBuffer());
    const unsubscribe = logger.subscribe((entry) => {
      setLogs(prev => [...prev.slice(-999), entry]);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
      const matchesSource = !filterSource || log.source.toLowerCase().includes(filterSource.toLowerCase());
      const matchesSearch = !searchTerm || 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLevel && matchesSource && matchesSearch;
    });
  }, [logs, filterLevel, filterSource, searchTerm]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `webjuggler-logs-${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleClear = () => {
    logger.clearBuffer();
    setLogs([]);
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'debug': return <Bug className="w-3 h-3 text-gray-400" />;
      case 'info': return <Info className="w-3 h-3 text-blue-400" />;
      case 'warn': return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-400" />;
      case 'fatal': return <Zap className="w-3 h-3 text-red-600" />;
    }
  };

  const getLevelClass = (level: LogLevel) => {
    switch (level) {
      case 'debug': return 'text-gray-400';
      case 'info': return 'text-blue-400';
      case 'warn': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'fatal': return 'text-red-600 font-bold';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-gray-900 text-gray-100 rounded-lg shadow-2xl w-[600px] h-[450px] flex flex-col border border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold">Debug Console</span>
                <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-400 uppercase tracking-wider">
                  {logs.length} entries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExport}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  title="Export to JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleClear}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors text-red-400"
                  title="Clear Buffer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="p-2 border-b border-gray-700 flex gap-2 bg-gray-850">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded pl-8 pr-2 py-1 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <select 
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
                <option value="fatal">Fatal</option>
              </select>
              <input 
                type="text"
                placeholder="Source..."
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none"
              />
            </div>

            {/* Logs Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-2 font-mono text-[11px] space-y-1 scrollbar-thin scrollbar-thumb-gray-700"
            >
              {filteredLogs.map((log, i) => (
                <div key={i} className="group hover:bg-gray-800 p-1 rounded transition-colors border-l-2 border-transparent hover:border-indigo-500">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 shrink-0">{log.timestamp.split('T')[1].split('.')[0]}</span>
                    <span className="shrink-0">{getLevelIcon(log.level)}</span>
                    <span className={cn("shrink-0 font-bold", getLevelClass(log.level))}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-indigo-400 shrink-0">[{log.source}]</span>
                    <span className="break-all">{log.message}</span>
                  </div>
                  {log.data && (
                    <pre className="mt-1 ml-6 p-2 bg-gray-950 rounded text-gray-400 overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                  {log.correlationId && (
                    <div className="mt-1 ml-6 text-[10px] text-gray-600">
                      CID: {log.correlationId}
                    </div>
                  )}
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                  <Terminal className="w-8 h-8 mb-2 opacity-20" />
                  <p>No logs matching filters</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="bg-gray-900 text-white p-3 rounded-full shadow-lg border border-gray-700 flex items-center gap-2 hover:bg-indigo-600 transition-colors"
          >
            <Terminal className="w-5 h-5" />
            <span className="text-xs font-medium pr-1">Debug Console</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
