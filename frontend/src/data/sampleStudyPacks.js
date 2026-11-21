export const initialStudyPacks = [
  {
    id: 'pack-bio-101',
    title: 'Cellular Respiration & Metabolic Pathways',
    subject: 'Biology / Biochemistry',
    fileName: 'Lecture_04_Cellular_Respiration.pdf',
    fileSize: '4.2 MB',
    fileType: 'pdf',
    characterCount: 14200,
    wordCount: 2180,
    createdAt: '2026-11-19T10:30:00Z',
    overview: 'This study pack explores the biochemical mechanisms of cellular respiration, detailing glycolysis, the citric acid cycle (Krebs cycle), and oxidative phosphorylation with ATP synthase activity.',
    chapters: [
      {
        chapter_title: '1. Glycolysis — The Cytoplasmic Breakdown',
        summary_points: [
          'Occurs in the cytoplasm without requiring oxygen (anaerobic).',
          'Consists of an energy-investment phase (2 ATP consumed) and energy-payoff phase (4 ATP produced).',
          'Yields a net gain of 2 ATP, 2 NADH, and 2 Pyruvate molecules per glucose.',
          'Phosphofructokinase (PFK) acts as the key regulatory allosteric enzyme inhibited by high ATP and citrate.'
        ],
        takeaway: 'Glycolysis is the primordial pathway that converts 1 glucose molecule into 2 pyruvate molecules with a net output of 2 ATP and 2 NADH.'
      },
      {
        chapter_title: '2. Pyruvate Oxidation and the Citric Acid Cycle',
        summary_points: [
          'Pyruvate enters mitochondrial matrix via active transport and is decarboxylated into Acetyl-CoA by Pyruvate Dehydrogenase.',
          'Acetyl-CoA combines with oxaloacetate (4C) to form citrate (6C) in the Krebs cycle.',
          'Each acetyl group produces 3 NADH, 1 FADH2, 1 ATP (or GTP), and 2 CO2 molecules.',
          'Two turns of the cycle occur per initial glucose molecule.'
        ],
        takeaway: 'The Krebs cycle fully oxidizes organic carbons into carbon dioxide while transferring high-energy electrons onto NADH and FADH2 carriers.'
      },
      {
        chapter_title: '3. Oxidative Phosphorylation & Chemiosmosis',
        summary_points: [
          'Electrons from NADH and FADH2 traverse protein complexes I through IV in the inner mitochondrial membrane.',
          'Protons (H+) are pumped across the inner membrane into the intermembrane space, creating an electrochemical gradient (proton motive force).',
          'Oxygen serves as the terminal electron acceptor, reduced to H2O.',
          'ATP Synthase harnesses the proton influx to phosphorylate ADP into ATP, generating ~26-28 ATP.'
        ],
        takeaway: 'Chemiosmosis couples electron transport chain proton pumping to ATP synthesis, producing the vast majority of cellular ATP.'
      }
    ],
    keywords: [
      {
        term: 'Glycolysis',
        definition: 'The initial anaerobic 10-step metabolic sequence occurring in the cytosol that splits glucose into two pyruvate molecules.',
        context: 'Essential for fast anaerobic bursts and precursor production in all aerobic organisms.'
      },
      {
        term: 'Proton Motive Force',
        definition: 'An electrochemical gradient consisting of both a chemical concentration difference and electrical voltage across the inner mitochondrial membrane.',
        context: 'Drives the rotary catalytic motor of ATP Synthase to generate ATP.'
      },
      {
        term: 'Allosteric Regulation',
        definition: 'The modulation of enzyme activity through the non-covalent binding of an effector molecule at a site other than the active site.',
        context: 'Phosphofructokinase is allosterically regulated by ATP/AMP ratios to match metabolic demand.'
      },
      {
        term: 'Chemiosmosis',
        definition: 'The movement of ions across a semipermeable membrane down their electrochemical gradient to power biochemical synthesis.',
        context: 'Proposed by Peter Mitchell in 1961, proving ATP synthesis is mechanically coupled to transmembrane proton flow.'
      }
    ],
    practice_questions: [
      {
        question: 'What is the net yield of ATP and reduced electron carriers from one molecule of glucose during glycolysis?',
        answer: 'Net yield is 2 ATP and 2 NADH.',
        explanation: 'Although 4 ATP are produced in the payoff phase, 2 ATP are consumed during the initial hexokinase and PFK steps, resulting in a net yield of 2 ATP.',
        hint: 'Remember the energy investment phase consumes ATP.'
      },
      {
        question: 'Why does FADH2 generate fewer ATP molecules than NADH in the electron transport chain?',
        answer: 'FADH2 enters the ETC at Complex II rather than Complex I, bypassing the first proton-pumping complex.',
        explanation: 'Because electrons from FADH2 bypass Complex I, fewer protons are pumped into the intermembrane space, resulting in approximately 1.5 ATP versus 2.5 ATP from NADH.',
        hint: 'Look at the complex entry points along the inner membrane.'
      },
      {
        question: 'What is the final electron acceptor in aerobic respiration, and what product is formed?',
        answer: 'Molecular oxygen (O2) is the final electron acceptor, forming water (H2O).',
        explanation: 'At Complex IV (cytochrome c oxidase), electrons are transferred to O2 along with matrix protons to produce water.',
        hint: 'Think about why animals must breathe oxygen.'
      }
    ],
    quiz: [
      {
        id: 1,
        question: 'Where in the eukaryotic cell does the Citric Acid (Krebs) Cycle take place?',
        options: [
          { id: 'A', text: 'Cytosol' },
          { id: 'B', text: 'Mitochondrial Matrix' },
          { id: 'C', text: 'Intermembrane Space' },
          { id: 'D', text: 'Outer Mitochondrial Membrane' }
        ],
        correct_option_id: 'B',
        explanation: 'The Citric Acid Cycle enzymes are dissolved within the mitochondrial matrix, while glycolysis occurs in the cytosol.'
      },
      {
        id: 2,
        question: 'Which enzyme catalyzes the committed, heavily regulated step of glycolysis?',
        options: [
          { id: 'A', text: 'Hexokinase' },
          { id: 'B', text: 'Phosphofructokinase-1 (PFK-1)' },
          { id: 'C', text: 'Pyruvate Kinase' },
          { id: 'D', text: 'Aldolase' }
        ],
        correct_option_id: 'B',
        explanation: 'PFK-1 catalyzes the phosphorylation of fructose-6-phosphate to fructose-1,6-bisphosphate, which is the primary rate-limiting step.'
      },
      {
        id: 3,
        question: 'What serves as the immediate direct power source for ATP Synthase during chemiosmosis?',
        options: [
          { id: 'A', text: 'Direct hydrolysis of glucose' },
          { id: 'B', text: 'Electrochemical proton gradient across the inner membrane' },
          { id: 'C', text: 'Direct transfer of phosphate from NADH' },
          { id: 'D', text: 'Thermal friction in the matrix' }
        ],
        correct_option_id: 'B',
        explanation: 'The proton motive force created by the ETC drives protons through the F0 rotor subunit of ATP Synthase.'
      },
      {
        id: 4,
        question: 'How many carbon dioxide (CO2) molecules are released per glucose molecule across cellular respiration?',
        options: [
          { id: 'A', text: '2 CO2' },
          { id: 'B', text: '4 CO2' },
          { id: 'C', text: '6 CO2' },
          { id: 'D', text: '12 CO2' }
        ],
        correct_option_id: 'C',
        explanation: 'All 6 carbons of glucose are released as CO2: 2 during pyruvate oxidation and 4 during the two turns of the Citric Acid Cycle.'
      }
    ],
    lastQuizScore: { score: 4, total: 4, percentage: 100, date: '2026-11-20T14:15:00Z' }
  },
  {
    id: 'pack-cs-301',
    title: 'Operating Systems: Concurrency, Locks & Deadlocks',
    subject: 'Computer Science',
    fileName: 'CS301_Week6_Concurrency_Semaphores.pptx',
    fileSize: '3.1 MB',
    fileType: 'pptx',
    characterCount: 18450,
    wordCount: 2840,
    createdAt: '2026-11-18T16:45:00Z',
    overview: 'Detailed study pack covering multi-threaded process execution, race conditions, atomic hardware instructions, mutex locks, semaphores, and Coffman conditions for deadlock prevention.',
    chapters: [
      {
        chapter_title: '1. Threads & The Critical Section Problem',
        summary_points: [
          'Threads within the same process share heap, globals, and file descriptors, but maintain separate stacks and program counters.',
          'Race conditions happen when two concurrent threads access shared data and execution outcome depends on timing.',
          'Critical Section requires three criteria: Mutual Exclusion, Progress, and Bounded Waiting.',
          'Atomic CPU instructions like Compare-And-Swap (CAS) and Test-And-Set provide foundation for spinlocks.'
        ],
        takeaway: 'Synchronization primitives enforce mutual exclusion on shared resources to eliminate non-deterministic race conditions.'
      },
      {
        chapter_title: '2. Semaphores and Condition Variables',
        summary_points: [
          'A Counting Semaphore holds an integer counter accessed only via atomic wait (P) and signal (V) operations.',
          'Binary semaphores function as mutex locks with values of 0 or 1.',
          'Condition variables allow threads to sleep (wait) until a specific state predicate is signaled by another thread.',
          'Mesa semantics require while-loops around wait() to guard against spurious wakeups.'
        ],
        takeaway: 'Semaphores manage pooled resource access, while condition variables enable efficient thread signaling without busy waiting.'
      },
      {
        chapter_title: '3. Deadlocks & The Coffman Conditions',
        summary_points: [
          'Deadlock occurs when every process in a set is waiting for an event that only another process in the set can cause.',
          'Four necessary Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
          'Resource Ordering: Enforcing a global total ordering on lock acquisition mathematically breaks Circular Wait.',
          'Bankers Algorithm provides deadlock avoidance by assessing safe states before granting allocations.'
        ],
        takeaway: 'Breaking any one of the four Coffman conditions guarantees deadlock cannot occur in the system.'
      }
    ],
    keywords: [
      {
        term: 'Mutual Exclusion',
        definition: 'A concurrency property ensuring that at most one thread or process may execute in a critical section at any given moment.',
        context: 'Without mutual exclusion, concurrent updates to shared counters produce data corruption.'
      },
      {
        term: 'Race Condition',
        definition: 'A flaw wherein the output or state of a program is dependent on the uncontrollable order or timing of uncontrollable concurrent threads.',
        context: 'Demonstrated by concurrent non-atomic increment operations (read-modify-write).'
      },
      {
        term: 'Coffman Conditions',
        definition: 'The four necessary and sufficient conditions for a system deadlock: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
        context: 'Formulated by Edward G. Coffman Jr. in 1971 to systematically analyze deadlock vulnerabilities.'
      },
      {
        term: 'Spinlock',
        definition: 'A lock where a thread waiting for access continuously checks a condition in a loop (busy waiting) rather than sleeping.',
        context: 'Efficient for very short critical sections where context-switching overhead exceeds wait time.'
      }
    ],
    practice_questions: [
      {
        question: 'What are the three essential requirements for any valid solution to the Critical Section problem?',
        answer: 'Mutual Exclusion, Progress, and Bounded Waiting.',
        explanation: 'Mutual exclusion prevents simultaneous entry; progress ensures waiting threads eventually enter; bounded waiting guarantees a thread is not starved indefinitely.',
        hint: 'Think about fairness and starvation.'
      },
      {
        question: 'How does imposing a global lock hierarchy (total ordering) prevent system deadlocks?',
        answer: 'It strictly eliminates the Circular Wait condition.',
        explanation: 'If all threads acquire locks in increasing numerical order, a cyclic dependency cannot form in the resource allocation graph.',
        hint: 'Recall which of the 4 Coffman conditions is targeted.'
      }
    ],
    quiz: [
      {
        id: 1,
        question: 'Which of the following is NOT one of the four Coffman conditions required for a deadlock?',
        options: [
          { id: 'A', text: 'Mutual Exclusion' },
          { id: 'B', text: 'Circular Wait' },
          { id: 'C', text: 'Preemptive Scheduling' },
          { id: 'D', text: 'Hold and Wait' }
        ],
        correct_option_id: 'C',
        explanation: 'No Preemption is the requirement for deadlock; preemptive scheduling actually prevents or resolves deadlocks.'
      },
      {
        id: 2,
        question: 'Why should a thread wait on a condition variable inside a while loop rather than an if statement?',
        options: [
          { id: 'A', text: 'To avoid memory leaks' },
          { id: 'B', text: 'To guard against spurious wakeups and ensure the predicate is still true' },
          { id: 'C', text: 'Because while loops execute faster than if statements' },
          { id: 'D', text: 'To automatically release the mutex permanently' }
        ],
        correct_option_id: 'B',
        explanation: 'Under Mesa semantics, another thread may claim the resource between the time a thread is signaled and when it wakes up.'
      },
      {
        id: 3,
        question: 'What does a semaphore value representing an integer less than zero typically signify in an implementation?',
        options: [
          { id: 'A', text: 'System error' },
          { id: 'B', text: 'The magnitude indicates the count of threads blocked waiting on the semaphore' },
          { id: 'C', text: 'The resource has been deleted' },
          { id: 'D', text: 'All locks are released' }
        ],
        correct_option_id: 'B',
        explanation: 'In POSIX-like implementations, negative semaphore values directly indicate how many processes are queued waiting.'
      }
    ],
    lastQuizScore: { score: 2, total: 3, percentage: 67, date: '2026-11-20T19:00:00Z' }
  },
  {
    id: 'pack-econ-201',
    title: 'Macroeconomics: Monetary Policy & Inflation Dynamics',
    subject: 'Economics / Finance',
    fileName: 'Econ201_Monetary_Policy_Lecture.txt',
    fileSize: '1.8 MB',
    fileType: 'txt',
    characterCount: 11900,
    wordCount: 1950,
    createdAt: '2026-11-17T11:15:00Z',
    overview: 'Covers the central bank toolset (reserve requirements, discount window, open market operations), the Taylor Rule, quantitative easing, Phillips Curve tradeoffs, and inflation targeting frameworks.',
    chapters: [
      {
        chapter_title: '1. Central Bank Tools and the Money Multiplier',
        summary_points: [
          'Central banks control monetary base through open market operations (purchasing and selling sovereign debt).',
          'Fractional reserve banking expands money supply proportional to the reserve ratio multiplier (1 / R).',
          'The policy interest rate (federal funds rate) anchors commercial lending and interbank overnight borrowing.',
          'Unconventional tools like Quantitative Easing (QE) directly target long-term yield curve compression.'
        ],
        takeaway: 'Central banks control short-term borrowing costs to stimulate or dampen aggregate demand.'
      },
      {
        chapter_title: '2. The Phillips Curve and Inflation Expectations',
        summary_points: [
          'The traditional short-run Phillips Curve posits an inverse relationship between unemployment and inflation.',
          'Stagflation of the 1970s demonstrated that long-run Phillips Curve is vertical at the Natural Rate of Unemployment (NAIRU).',
          'Anchoring public inflation expectations is critical to avoiding wage-price spirals.'
        ],
        takeaway: 'In the long run, monetary policy cannot sustainably trade inflation for lower unemployment beyond the natural rate.'
      }
    ],
    keywords: [
      {
        term: 'Open Market Operations',
        definition: 'The buying and selling of government securities in the open market by a central bank to expand or contract money supply.',
        context: 'The primary daily mechanism used to steer overnight lending rates.'
      },
      {
        term: 'Taylor Rule',
        definition: 'A monetary policy guideline linking targeted central bank policy rates to current inflation gaps and output gap deviations.',
        context: 'Proposed by John B. Taylor in 1993 to model stabilizing interest rate adjustments.'
      },
      {
        term: 'Quantitative Easing (QE)',
        definition: 'An unconventional monetary policy whereby a central bank purchases longer-term securities from the open market to increase money supply and lower long-term yields.',
        context: 'Used when benchmark policy rates hit the zero lower bound (ZLB).'
      }
    ],
    practice_questions: [
      {
        question: 'When a central bank sells government bonds on the open market, what is the immediate effect on bank reserves and interest rates?',
        answer: 'Bank reserves decrease, causing the interbank interest rate to rise.',
        explanation: 'Commercial banks pay for the bonds using their reserves, reducing liquidity in the banking system and increasing borrowing costs.',
        hint: 'Think about supply and demand for bank reserves.'
      }
    ],
    quiz: [
      {
        id: 1,
        question: 'What happens to the money supply when a central bank raises the reserve requirement ratio?',
        options: [
          { id: 'A', text: 'It increases exponentially' },
          { id: 'B', text: 'It decreases because banks must hold more cash and lend less' },
          { id: 'C', text: 'It remains completely unchanged' },
          { id: 'D', text: 'Inflation immediately doubles' }
        ],
        correct_option_id: 'B',
        explanation: 'A higher reserve requirement reduces the money multiplier (1/R), curbing credit creation.'
      },
      {
        id: 2,
        question: 'What is the shape of the Long-Run Phillips Curve (LRPC)?',
        options: [
          { id: 'A', text: 'Downward sloping' },
          { id: 'B', text: 'Horizontal' },
          { id: 'C', text: 'Vertical at the natural rate of unemployment' },
          { id: 'D', text: 'Upward sloping' }
        ],
        correct_option_id: 'C',
        explanation: 'In the long run, inflation expectations adjust, resulting in no tradeoff between inflation and the structural rate of unemployment.'
      }
    ],
    lastQuizScore: { score: 2, total: 2, percentage: 100, date: '2026-11-21T09:30:00Z' }
  }
];
