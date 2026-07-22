import { useState, useEffect } from 'react';
import { Users, Copy, Plus, RefreshCw, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import toast from 'react-hot-toast';

const BunkSquad = () => {
    const { courses } = useCourseStore();
    const [squadCode, setSquadCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [inSquad, setInSquad] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Mock friends data that gets "synced"
    const [squadMembers, setSquadMembers] = useState([]);

    const generateCode = () => {
        const code = 'SQD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        setSquadCode(code);
        setInSquad(true);
        // Add self
        setSquadMembers([{
            id: 1,
            name: "You",
            avatar: "👤",
            isMe: true,
            status: 'safe',
            lowestAttendance: calculateLowest(courses)
        }]);
        toast.success('Squad created! Share the code with friends.');
    };

    const joinSquad = (e) => {
        e.preventDefault();
        if (joinCode.length < 5) return;
        setSyncing(true);
        setTimeout(() => {
            setSquadCode(joinCode.toUpperCase());
            setInSquad(true);
            setSyncing(false);
            // Add self and dummy friends
            setSquadMembers([
                { id: 1, name: "You", avatar: "👤", isMe: true, status: 'safe', lowestAttendance: calculateLowest(courses) },
                { id: 2, name: "Rahul", avatar: "🧑🏽", isMe: false, status: 'safe', lowestAttendance: 82.5 },
                { id: 3, name: "Priya", avatar: "👩🏽", isMe: false, status: 'danger', lowestAttendance: 74.2 },
            ]);
            toast.success('Joined Squad Successfully!');
        }, 1500);
    };

    const simulateGroupBunk = () => {
        setSyncing(true);
        setTimeout(() => {
            // Drop everyone's attendance by ~2-3%
            const updated = squadMembers.map(member => {
                const newAtt = member.lowestAttendance - (Math.random() * 2 + 1);
                return {
                    ...member,
                    lowestAttendance: newAtt,
                    status: newAtt < 75 ? 'danger' : 'safe'
                };
            });
            setSquadMembers(updated);
            setSyncing(false);
            
            const victims = updated.filter(m => m.status === 'danger').length;
            if (victims > 0) {
                toast.error(`Warning: ${victims} member(s) will fall below 75% if you bunk together!`);
            } else {
                toast.success('Group Bunk is SAFE! Enjoy your day out! 🎉');
            }
        }, 1500);
    };

    const calculateLowest = (coursesList) => {
        if (!coursesList.length) return 100;
        let lowest = 100;
        coursesList.forEach(c => {
            if (c.total_classes === 0) return;
            const pct = (c.classes_attended / c.total_classes) * 100;
            if (pct < lowest) lowest = pct;
        });
        return lowest;
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
                    <Users className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Bunk Squad Sync</h1>
                    <p className="text-neutral-500">Sync attendance with friends before skipping together</p>
                </div>
            </div>

            {!inSquad ? (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Create Squad */}
                    <div className="glass-card p-8 border-gray-200 text-center space-y-6">
                        <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-pink-400" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">Create a Squad</h2>
                        <p className="text-neutral-500 text-sm">Start a new bunk group and invite your friends to sync your schedules.</p>
                        <button 
                            onClick={generateCode}
                            className="w-full bg-pink-600 hover:bg-pink-500 text-neutral-900 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-pink-500/20"
                        >
                            Generate Squad Code
                        </button>
                    </div>

                    {/* Join Squad */}
                    <div className="glass-card p-8 border-gray-200 text-center space-y-6">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">Join a Squad</h2>
                        <p className="text-neutral-500 text-sm">Have an invite code from a friend? Enter it below to link up.</p>
                        <form onSubmit={joinSquad} className="space-y-4">
                            <input 
                                type="text"
                                placeholder="Enter Code (e.g. SQD-123)"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                className="w-full bg-black border border-gray-200 rounded-xl px-4 py-3 text-center text-neutral-900 focus:outline-none focus:border-blue-500 uppercase tracking-widest font-mono"
                            />
                            <button 
                                type="submit"
                                disabled={syncing || joinCode.length < 5}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-neutral-900 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2"
                            >
                                {syncing ? <RefreshCw className="animate-spin w-5 h-5" /> : 'Join Squad'}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    
                    {/* Active Squad Header */}
                    <div className="glass-card p-6 border-pink-500/30 bg-pink-500/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                <Users className="text-pink-400 w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900">Active Squad</h2>
                                <p className="text-neutral-500 text-sm">3 members connected</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-black px-4 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-pink-500/50 transition-colors" onClick={() => {navigator.clipboard.writeText(squadCode); toast.success('Code copied!')}}>
                            <span className="text-neutral-500 font-mono text-sm">CODE:</span>
                            <span className="text-pink-400 font-bold font-mono tracking-widest">{squadCode}</span>
                            <Copy size={16} className="text-neutral-500 ml-2" />
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {squadMembers.map(member => (
                            <div key={member.id} className="glass-card p-5 border-gray-200 relative overflow-hidden">
                                {member.isMe && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-3xl bg-white w-12 h-12 flex items-center justify-center rounded-full">
                                        {member.avatar}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                                            {member.name} {member.isMe && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                                        </h3>
                                        <span className={`text-xs font-bold flex items-center gap-1 ${member.status === 'safe' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {member.status === 'safe' ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
                                            {member.status === 'safe' ? 'SAFE ZONE' : 'DANGER ZONE'}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="text-xs text-neutral-500 mb-1">Lowest Subject Margin</div>
                                    <div className={`text-2xl font-black ${member.lowestAttendance >= 75 ? 'text-emerald-400' : 'text-red-500'}`}>
                                        {member.lowestAttendance.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Simulation Action */}
                    <div className="mt-8">
                        <button 
                            onClick={simulateGroupBunk}
                            disabled={syncing}
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-neutral-900 p-6 rounded-2xl font-black text-xl transition-all shadow-[0_0_40px_rgba(219,39,119,0.3)] disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <div className="relative z-10 flex items-center justify-center gap-3">
                                {syncing ? (
                                    <>
                                        <RefreshCw className="animate-spin" /> Calculating Group Impact...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="fill-white" /> Simulate Group Bunk
                                    </>
                                )}
                            </div>
                        </button>
                        <p className="text-center text-sm text-neutral-500 mt-4">
                            This will calculate the mathematical impact on everyone's attendance if the entire squad skips 1 class together.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BunkSquad;
