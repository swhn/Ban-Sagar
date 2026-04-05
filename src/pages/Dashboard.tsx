import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SlangCard, SlangData } from '../components/SlangCard';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ShieldAlert, Database, CheckCircle, Clock, XCircle, ClipboardList, Copy, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { seedSlangs } from '../data/seedSlangs';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { user, appUser, isAuthReady } = useAuth();
  const navigate = useNavigate();
  
  const [activeMenu, setActiveMenu] = useState<'review' | 'duplicates' | 'database'>('review');
  const [slangs, setSlangs] = useState<SlangData[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Duplicates state
  const [duplicates, setDuplicates] = useState<{word: string, items: SlangData[]}[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isAuthReady) return;
    
    if (!user || (appUser?.role !== 'moderator' && appUser?.role !== 'admin')) {
      navigate('/');
      return;
    }

    if (activeMenu === 'review') {
      setLoading(true);
      const q = query(
        collection(db, 'slangs'),
        where('status', '==', activeTab),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const slangData: SlangData[] = [];
        snapshot.forEach((doc) => {
          slangData.push({ id: doc.id, ...doc.data() } as SlangData);
        });
        setSlangs(slangData);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'slangs');
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, appUser, isAuthReady, navigate, activeTab, activeMenu]);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'slangs', id), {
        status: 'approved',
        updatedAt: serverTimestamp()
      });
      setMessage({ text: 'Submission approved.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `slangs/${id}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, 'slangs', id), {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });
      setMessage({ text: 'Submission rejected.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `slangs/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'slangs', id));
      setMessage({ text: 'Slang deleted successfully.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      if (activeMenu === 'duplicates') {
        scanDuplicates();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `slangs/${id}`);
    }
  };

  const scanDuplicates = async () => {
    setIsScanning(true);
    try {
      const slangsRef = collection(db, 'slangs');
      const snapshot = await getDocs(slangsRef);
      
      const wordMap = new Map<string, SlangData[]>();
      
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() } as SlangData;
        const normalizedWord = data.word.toLowerCase().trim();
        if (!wordMap.has(normalizedWord)) {
          wordMap.set(normalizedWord, []);
        }
        wordMap.get(normalizedWord)!.push(data);
      });

      const dupes: {word: string, items: SlangData[]}[] = [];
      wordMap.forEach((items, word) => {
        if (items.length > 1) {
          dupes.push({ word, items });
        }
      });

      setDuplicates(dupes);
      if (dupes.length === 0) {
        setMessage({ text: 'No duplicates found!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'slangs');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSeed = async () => {
    if (!user || !appUser) return;
    
    setIsSeeding(true);
    setMessage({ text: 'Checking for existing slangs...', type: 'success' });
    try {
      const slangsRef = collection(db, 'slangs');
      const existingDocs = await getDocs(slangsRef);
      const existingWords = new Set(existingDocs.docs.map(doc => doc.data().word.toLowerCase().trim()));

      const newSlangs = seedSlangs.filter(slang => !existingWords.has(slang.word.toLowerCase().trim()));

      if (newSlangs.length === 0) {
        setMessage({ text: 'All seed words are already in the database!', type: 'success' });
        setIsSeeding(false);
        return;
      }

      setMessage({ text: `Seeding ${newSlangs.length} new slangs...`, type: 'success' });

      const promises = newSlangs.map(slang => 
        addDoc(slangsRef, {
          word: slang.word,
          pronunciation: slang.pronunciation || '',
          meaning: slang.meaning,
          meaningBurmese: slang.meaningBurmese,
          examples: slang.examples,
          authorId: user.uid,
          authorName: appUser.displayName || 'System Admin',
          status: 'approved',
          upvotes: 0,
          downvotes: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      );
      await Promise.all(promises);
      setMessage({ text: 'Successfully seeded slangs!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error seeding data:', error);
      setMessage({ text: `Error seeding data: ${error.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setIsSeeding(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8"
    >
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="p-5 bg-indigo-50 text-indigo-600 rounded-3xl border border-indigo-100 shadow-sm flex items-center gap-4">
          <ShieldAlert className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-xs font-medium text-indigo-500 uppercase tracking-wider">{appUser?.role}</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveMenu('review')} 
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all", 
              activeMenu === 'review' ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <ClipboardList className="w-5 h-5" /> Review Submissions
          </button>
          
          <button 
            onClick={() => { setActiveMenu('duplicates'); scanDuplicates(); }} 
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all", 
              activeMenu === 'duplicates' ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Copy className="w-5 h-5" /> Scan Duplicates
          </button>
          
          {appUser?.role === 'admin' && (
            <button 
              onClick={() => setActiveMenu('database')} 
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all", 
                activeMenu === 'database' ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Database className="w-5 h-5" /> Database
            </button>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 space-y-6">
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-2xl text-sm font-medium shadow-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}
            >
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {activeMenu === 'review' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit border border-slate-200/50">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'pending' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
              >
                <Clock className="w-4 h-4" /> Pending
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'approved' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
              >
                <CheckCircle className="w-4 h-4" /> Approved
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'rejected' ? 'bg-white text-red-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
              >
                <XCircle className="w-4 h-4" /> Rejected
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              </div>
            ) : slangs.length > 0 ? (
              <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                  {slangs.map((slang, index) => (
                    <motion.div
                      key={slang.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SlangCard 
                        slang={slang} 
                        isModeratorView={true}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onEdit={(id) => navigate(`/edit/${id}`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm"
              >
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">All caught up!</h3>
                <p className="text-slate-500 text-lg">There are no {activeTab} submissions to review.</p>
              </motion.div>
            )}
          </div>
        )}

        {activeMenu === 'duplicates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Duplicate Words</h2>
                <p className="text-slate-500 mt-1">Find and resolve multiple entries for the same slang word.</p>
              </div>
              <button 
                onClick={scanDuplicates} 
                disabled={isScanning} 
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 text-sm font-semibold transition-all w-full sm:w-auto"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Rescan Database
              </button>
            </div>

            {isScanning ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              </div>
            ) : duplicates.length > 0 ? (
              <div className="space-y-6">
                {duplicates.map(group => (
                  <div key={group.word} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
                      "{group.word}" 
                      <span className="text-sm font-medium text-slate-500 ml-3 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {group.items.length} entries
                      </span>
                    </h3>
                    <div className="grid gap-4">
                      {group.items.map(item => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={cn(
                                "text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider", 
                                item.status === 'approved' ? "bg-emerald-100 text-emerald-700" : 
                                item.status === 'pending' ? "bg-amber-100 text-amber-700" : 
                                "bg-red-100 text-red-700"
                              )}>
                                {item.status}
                              </span>
                              <span className="text-sm font-medium text-slate-500">by {item.authorName}</span>
                              <span className="text-sm font-medium text-slate-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Unknown date'}
                              </span>
                            </div>
                            <p className="text-slate-900 font-medium line-clamp-2">{item.meaning}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Link 
                              to={`/slang/${item.id}`}
                              target="_blank"
                              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-xl text-sm font-semibold transition-all shadow-sm"
                            >
                              <ExternalLink className="w-4 h-4" /> View
                            </Link>
                            <button 
                              onClick={() => handleDelete(item.id)} 
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-semibold transition-all"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">No duplicates found</h3>
                <p className="text-slate-500 text-lg">Your dictionary is clean and organized.</p>
              </div>
            )}
          </div>
        )}

        {activeMenu === 'database' && appUser?.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 shrink-0">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900">Seed Initial Data</h3>
                  <p className="text-slate-500 mt-2 mb-6 text-lg">
                    Populate the database with 100 common Myanmar slangs. This will skip any words that already exist in the database to prevent duplicates.
                  </p>
                  <button
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-md active:scale-95 disabled:opacity-70"
                  >
                    {isSeeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                    Seed 100 Slangs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </motion.div>
  );
}
