import { useState, useEffect } from 'react';
import { Trophy, Flame, Target, Star, Shield, Zap, Clock, Calendar, Share2, Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { calculatePercentage, calculateClassesNeeded, calculateClassesCanMiss } from '../utils/helpers';
import toast from 'react-hot-toast';

const Achievements = () => {
    const { user } = useAuthStore();
    const { courses, fetchCourses } = useCourseStore();
    const [activeTab, setActiveTab] = useState('badges');

    useEffect(() => {
        if (user) fetchCourses(user.id);
    }, [user, fetchCourses]);

    const totalClasses = courses.reduce((sum, c) => sum + c.total_classes, 0);
    const totalAttended = courses.reduce((sum, c) => sum + c.classes_attended, 0);
    const overallPercentage = totalClasses > 0 ? parseFloat(calculatePercentage(totalAttended, totalClasses)) : 0;
    const coursesAbove90 = courses.filter(c => c.total_classes > 0 && (c.classes_attended / c.total_classes) * 100 >= 90).length;
    const coursesAboveTarget = courses.filter(c => {
        if (c.total_classes === 0) return false;
        return (c.classes_attended / c.total_classes) * 100 >= (c.target_percentage || 75);
    }).length;
    const perfectCourses = courses.filter(c => c.total_classes > 0 && c.classes_attended === c.total_classes).length;
    const completedCourses = courses.filter(c => c.is_completed).length;

    // Build real achievements based on actual data
    const achievements = [
        {
            id: 'perfect',
            title: 'Perfect Attendance',
            description: 'Have 100% attendance in at least one course',
            icon: Trophy,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            barColor: 'bg-amber-500',
            progress: perfectCourses > 0 ? 100 : (courses.length > 0 ? Math.max(...courses.map(c => c.total_classes > 0 ? (c.classes_attended / c.total_classes) * 100 : 0)) : 0),
            unlocked: perfectCourses > 0,
            detail: perfectCourses > 0 ? `${perfectCourses} course(s) at 100%` : 'No perfect courses yet',
        },
        {
            id: 'consistent',
            title: 'Consistent',
            description: 'Maintain above 80% attendance overall',
            icon: Target,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            barColor: 'bg-emerald-500',
            progress: overallPercentage >= 80 ? 100 : (overallPercentage / 80) * 100,
            unlocked: overallPercentage >= 80,
            detail: `Overall: ${overallPercentage.toFixed(1)}%`,
        },
        {
            id: 'five_courses',
            title: 'Course Collector',
            description: 'Track at least 5 courses',
            icon: BookOpen,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            barColor: 'bg-blue-500',
            progress: Math.min((courses.length / 5) * 100, 100),
            unlocked: courses.length >= 5,
            detail: `${courses.length}/5 courses`,
        },
        {
            id: 'centurion',
            title: 'Centurion',
            description: 'Attend 100 or more classes total',
            icon: Award,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/20',
            barColor: 'bg-violet-500',
            progress: Math.min((totalAttended / 100) * 100, 100),
            unlocked: totalAttended >= 100,
            detail: `${totalAttended}/100 classes`,
        },
        {
            id: 'all_safe',
            title: 'All Safe',
            description: 'Have all courses above their target percentage',
            icon: Shield,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            barColor: 'bg-cyan-500',
            progress: courses.length > 0 ? (coursesAboveTarget / courses.length) * 100 : 0,
            unlocked: courses.length > 0 && coursesAboveTarget === courses.length,
            detail: `${coursesAboveTarget}/${courses.length} above target`,
        },
        {
            id: 'elite',
            title: 'Elite Student',
            description: 'Maintain 90%+ in at least 3 courses',
            icon: Star,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20',
            barColor: 'bg-orange-500',
            progress: Math.min((coursesAbove90 / 3) * 100, 100),
            unlocked: coursesAbove90 >= 3,
            detail: `${coursesAbove90}/3 courses at 90%+`,
        },
        {
            id: 'marathon',
            title: 'Marathon Runner',
            description: 'Attend 200 or more classes total',
            icon: TrendingUp,
            color: 'text-pink-400',
            bg: 'bg-pink-500/10',
            border: 'border-pink-500/20',
            barColor: 'bg-pink-500',
            progress: Math.min((totalAttended / 200) * 100, 100),
            unlocked: totalAttended >= 200,
            detail: `${totalAttended}/200 classes`,
        },
        {
            id: 'completer',
            title: 'Semester Done',
            description: 'Complete at least 1 course',
            icon: Zap,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
            barColor: 'bg-yellow-500',
            progress: completedCourses > 0 ? 100 : 0,
            unlocked: completedCourses > 0,
            detail: `${completedCourses} completed`,
        },
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    const handleShare = async () => {
        const shareText = `🎓 I've unlocked ${unlockedCount}/${achievements.length} achievements with ${overallPercentage.toFixed(1)}% overall attendance on SIMATS Attendance Manager!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Achievements — SAM',
                    text: shareText,
                    url: window.location.origin
                });
            } catch (err) {
                // user cancelled
            }
        } else {
            navigator.clipboard.writeText(shareText);
            toast.success('Copied to clipboard!');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1 font-semibold">Achievements</p>
                    <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                        Your Badges
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/[0.03] hover:bg-white/[0.06] text-neutral-600 dark:text-neutral-300 text-sm font-medium transition-colors"
                    >
                        <Share2 size={16} />
                        Share
                    </button>
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20">
                        <Trophy size={16} className="text-amber-400" />
                        <span className="text-sm font-bold text-amber-400">{unlockedCount}/{achievements.length}</span>
                    </div>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="rounded-2xl border border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Overall Progress</span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{unlockedCount} of {achievements.length} unlocked</span>
                </div>
                <div className="h-2 bg-white dark:bg-neutral-900 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {achievements.map((item) => (
                    <div
                        key={item.id}
                        className={`relative rounded-2xl border p-5 transition-all duration-300 overflow-hidden group ${
                            item.unlocked
                                ? `${item.border} bg-gray-100 dark:bg-white/[0.03] hover:bg-white/[0.05]`
                                : 'border-white/[0.04] bg-white/[0.01] opacity-60 hover:opacity-80'
                        }`}
                    >
                        {/* Background glow for unlocked */}
                        {item.unlocked && (
                            <div className={`absolute top-0 right-0 w-32 h-32 ${item.bg} rounded-full blur-3xl -mr-12 -mt-12 opacity-30`} />
                        )}

                        <div className="relative z-10">
                            {/* Icon + Badge */}
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${item.unlocked ? item.bg : 'bg-white dark:bg-neutral-900'}`}>
                                    <item.icon className={item.unlocked ? item.color : 'text-neutral-600'} size={22} />
                                </div>
                                {item.unlocked && (
                                    <span className="bg-amber-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                        <Star size={8} className="fill-black" /> Unlocked
                                    </span>
                                )}
                            </div>

                            {/* Title + Description */}
                            <h3 className={`font-bold text-base mb-1 ${item.unlocked ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
                                {item.title}
                            </h3>
                            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">{item.description}</p>

                            {/* Progress */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-neutral-500 font-medium">{item.detail}</span>
                                    <span className={item.unlocked ? item.color : 'text-neutral-600'}>
                                        {Math.min(100, Math.floor(item.progress))}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-white dark:bg-neutral-900 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${item.unlocked ? item.barColor : 'bg-neutral-700'}`}
                                        style={{ width: `${Math.min(100, item.progress)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Encouragement */}
            {unlockedCount < achievements.length && (
                <div className="rounded-2xl border border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] p-5 text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Keep attending classes to unlock more badges! You're <span className="text-neutral-900 dark:text-white font-semibold">{achievements.length - unlockedCount}</span> away from completing all achievements.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Achievements;
