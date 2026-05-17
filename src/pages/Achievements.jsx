import { useState } from 'react';
import { Trophy, Flame, Target, Star, Shield, Zap, Clock, Calendar, Share2, Users } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import { calculatePercentage } from '../utils/helpers';
import toast from 'react-hot-toast';

const Achievements = () => {
    const { courses } = useCourseStore();
    const [activeTab, setActiveTab] = useState('badges'); // 'badges' | 'leaderboard'

    const totalClasses = courses.reduce((sum, c) => sum + c.total_classes, 0);
    const totalAttended = courses.reduce((sum, c) => sum + c.classes_attended, 0);
    const overallPercentage = parseFloat(calculatePercentage(totalAttended, totalClasses));

    // Mock streaks data for now
    const streak = 7;
    const maxStreak = 14;

    const achievements = [
        {
            id: 1,
            title: 'Perfect Attendance',
            description: 'Maintained 100% attendance in all courses',
            icon: Trophy,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            progress: overallPercentage === 100 ? 100 : overallPercentage,
            unlocked: overallPercentage === 100,
            reward: 'Master Badge'
        },
        {
            id: 2,
            title: 'On A Roll',
            description: 'Attended classes for 7 days in a row',
            icon: Flame,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20',
            progress: (streak / 7) * 100,
            unlocked: streak >= 7,
            reward: 'Streak Fire'
        },
        {
            id: 3,
            title: 'Early Bird',
            description: 'Logged in before 8:00 AM',
            icon: Clock,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            progress: 100,
            unlocked: true, // Mocked
            reward: 'Morning Star'
        },
        {
            id: 4,
            title: 'Survivor',
            description: 'Attended all classes during exam week',
            icon: Shield,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            progress: 100,
            unlocked: true, // Mocked
            reward: 'Iron Shield'
        },
        {
            id: 5,
            title: 'Consistent',
            description: 'Above 80% attendance overall',
            icon: Target,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            progress: overallPercentage >= 80 ? 100 : (overallPercentage / 80) * 100,
            unlocked: overallPercentage >= 80,
            reward: 'Bullseye'
        },
        {
            id: 6,
            title: 'Course Master',
            description: 'Completed 50 classes total',
            icon: Star,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/20',
            progress: (totalAttended / 50) * 100,
            unlocked: totalAttended >= 50,
            reward: 'Violet Gem'
        }
    ];

    // Generate dynamic leaderboard data mixed with current user
    const leaderboardData = [
        { name: "Anonymous Panda", avatar: "🐼", score: 98, streak: 12 },
        { name: "Anonymous Tiger", avatar: "🐯", score: 95, streak: 9 },
        { name: "Anonymous Owl",   avatar: "🦉", score: 92, streak: 8 },
        { name: "You",             avatar: "👤", score: overallPercentage || 0, streak: streak, isCurrent: true },
        { name: "Anonymous Fox",   avatar: "🦊", score: 85, streak: 5 },
        { name: "Anonymous Bear",  avatar: "🐻", score: 78, streak: 2 },
    ].sort((a, b) => b.score - a.score).map((user, index) => ({ ...user, rank: index + 1 }));

    const handleShare = async () => {
        const shareText = `🔥 I just hit a ${streak}-day attendance streak with an overall score of ${overallPercentage}% on SIMATS AM! Can you beat my score?`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Attendance Streak',
                    text: shareText,
                    url: window.location.origin
                });
                toast.success('Thanks for sharing!');
            } catch (err) {
                console.log('Share canceled or failed', err);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            toast.success('Score copied to clipboard! Paste it in your story.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Trophy className="text-amber-400" size={28} />
                        Achievements
                    </h1>
                    <p className="text-neutral-400 text-sm mt-1">Unlock badges by attending classes</p>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handleShare}
                        className="glass-card flex items-center gap-2 px-4 py-3 bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors"
                    >
                        <Share2 size={18} />
                        <span className="text-sm font-bold">Share Story</span>
                    </button>
                    <div className="glass-card flex items-center gap-4 px-5 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
                        <div className="flex flex-col">
                            <span className="text-xs text-orange-300 font-medium uppercase tracking-wider">Current Streak</span>
                            <span className="text-2xl font-bold text-orange-500 flex items-center gap-1">
                                {streak} <Flame size={20} className="fill-orange-500" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-800">
                <button
                    onClick={() => setActiveTab('badges')}
                    className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'badges' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    <div className="flex items-center gap-2">
                        <Trophy size={16} />
                        My Badges
                    </div>
                    {activeTab === 'badges' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 rounded-t-full shadow-[0_-2px_10px_rgba(251,191,36,0.5)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'leaderboard' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    <div className="flex items-center gap-2">
                        <Users size={16} />
                        Peer Leaderboard
                    </div>
                    {activeTab === 'leaderboard' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]" />
                    )}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'badges' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((item) => (
                    <div
                        key={item.id}
                        className={`glass-card relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] ${item.unlocked ? item.border : 'border-neutral-800 grayscale opacity-80 hover:opacity-100 hover:grayscale-0'
                            }`}
                    >
                        {/* Background Glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity duration-500 ${item.unlocked ? item.bg : 'bg-neutral-800'
                            } opacity-40`} />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${item.unlocked ? item.bg : 'bg-neutral-800'}`}>
                                    <item.icon className={item.unlocked ? item.color : 'text-neutral-500'} size={24} />
                                </div>
                                {item.unlocked && (
                                    <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Star size={10} className="fill-black" /> UNLOCKED
                                    </span>
                                )}
                            </div>

                            <h3 className={`font-bold text-lg mb-1 ${item.unlocked ? 'text-white' : 'text-neutral-400'}`}>
                                {item.title}
                            </h3>
                            <p className="text-sm text-neutral-500 mb-4 h-10">{item.description}</p>

                            {/* Progress Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-400">Progress</span>
                                    <span className={item.unlocked ? item.color : 'text-neutral-500'}>
                                        {Math.min(100, Math.floor(item.progress))}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${item.unlocked ? item.bg.replace('/10', '') : 'bg-neutral-700'
                                            }`} // Hacky way to get solid color from bg class
                                        style={{
                                            backgroundColor: item.unlocked ? '' : '', // Tailwind util or style
                                            width: `${Math.min(100, item.progress)}%`
                                        }}
                                    />
                                    {/* Better reliable color classes */}
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${item.unlocked
                                                ? item.color.replace('text-', 'bg-')
                                                : 'bg-neutral-700'
                                            }`}
                                        style={{
                                            width: `${Math.min(100, item.progress)}%`,
                                            marginTop: '-6px'
                                        }}
                                    />
                                </div>
                            </div>

                            {item.unlocked && (
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-xs text-neutral-500">Reward</span>
                                    <span className={`text-xs font-bold ${item.color}`}>{item.reward}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            ) : (
                <div className="glass-card border-neutral-800 overflow-hidden">
                    <div className="p-4 bg-neutral-900/50 border-b border-neutral-800 flex justify-between items-center text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        <div className="flex gap-4">
                            <span className="w-8 text-center">Rank</span>
                            <span>Student</span>
                        </div>
                        <div className="flex gap-8 text-right">
                            <span className="w-16">Streak</span>
                            <span className="w-16">Score</span>
                        </div>
                    </div>
                    
                    <div className="divide-y divide-neutral-800/50">
                        {leaderboardData.map((user) => (
                            <div 
                                key={user.rank} 
                                className={`p-4 flex justify-between items-center transition-colors ${user.isCurrent ? 'bg-blue-500/10 relative overflow-hidden' : 'hover:bg-white/5'}`}
                            >
                                {user.isCurrent && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                )}
                                
                                <div className="flex items-center gap-4">
                                    <div className="w-8 flex justify-center">
                                        {user.rank === 1 ? <Trophy size={20} className="text-amber-400" /> : 
                                         user.rank === 2 ? <Trophy size={20} className="text-neutral-400" /> : 
                                         user.rank === 3 ? <Trophy size={20} className="text-amber-700" /> : 
                                         <span className="font-bold text-neutral-500">{user.rank}</span>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xl shadow-inner">
                                            {user.avatar}
                                        </div>
                                        <div>
                                            <div className={`font-bold ${user.isCurrent ? 'text-blue-400' : 'text-neutral-200'}`}>
                                                {user.name}
                                            </div>
                                            {user.isCurrent && <div className="text-[10px] text-blue-500/80 uppercase tracking-widest font-bold">That's You!</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-8 text-right items-center">
                                    <div className="w-16 flex items-center justify-end gap-1 font-bold text-orange-400">
                                        {user.streak} <Flame size={14} className="fill-orange-400" />
                                    </div>
                                    <div className="w-16 font-black text-lg text-emerald-400">
                                        {user.score.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Achievements;
