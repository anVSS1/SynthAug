import { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/useProjectStore';

const Terminal = () => {
    const logs = useProjectStore((state) => state.logs);
    const endOfLogsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfLogsRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [logs]);

    return (
        <div className="bg-dark-900 font-mono text-sm text-primary-300 p-4 h-full overflow-y-auto rounded-xl border border-dark-700">
            <div className="flex flex-col gap-1">
                {logs.map((log, index) => (
                    <div key={index} className="flex items-start">
                        <span className="text-primary-600 mr-2 select-none">{`>_`}</span>
                        <p className="whitespace-pre-wrap break-words">{log}</p>
                    </div>
                ))}
                <div ref={endOfLogsRef} />
            </div>
            {/* Blinking cursor simulation */}
            <div className="flex items-center mt-1">
                <span className="text-primary-600 mr-2 select-none">{`>_`}</span>
                <span className="bg-primary-500 h-4 w-2 animate-pulse"></span>
            </div>
        </div>
    );
};

export default Terminal;
