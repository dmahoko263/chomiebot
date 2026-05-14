// ─────────────────────────────────────────────────────────────────────────────
//  school.js  —  Exam Timetable + AI Study Guide (IIT 4203)
// ─────────────────────────────────────────────────────────────────────────────

const exams = [
    { date: '2026-05-18', time: '2:00 PM', subject: 'Artificial Intelligence', venue: 'EH' },
    { date: '2026-05-20', time: '9:00 AM', subject: 'Cloud Computing', venue: 'MPH' },
    { date: '2026-05-22', time: '9:00 AM', subject: 'Human Computer Interaction', venue: 'EH' },
    { date: '2026-05-27', time: '2:00 PM', subject: 'Network and Server Administration', venue: 'EH' },
    { date: '2026-05-28', time: '2:00 PM', subject: 'Integrative Programming', venue: 'MPH' },
]

function getCountdown(examDate, examTime) {
    const [hour, minute] = examTime.includes('PM')
        ? [parseInt(examTime) + 12, 0]
        : [parseInt(examTime), 0]
    const exam = new Date(`${examDate}T${String(hour).padStart(2,'0')}:00:00`)
    const now = new Date()
    const diff = exam - now

    if (diff < 0) return '✅ Done'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `⏳ ${days}d ${hours}h away`
    if (hours > 0) return `⚠️ ${hours}h ${mins}m away`
    return `🔴 ${mins}m away — GO NOW!`
}

// ─────────────────────────────────────────────────────────────────────────────
//  AI STUDY GUIDE DATA  (IIT 4203 — 24 exam questions, question by question)
// ─────────────────────────────────────────────────────────────────────────────

const aiQuestions = [
  {
    title: "Define the following terms",
    q: "i. State space.\nii. Frontier in tree/graph search.\niii. Heuristic function.\niv. Admissible heuristic.\nv. Optimal solution.",
    a: "🗺️ *Think of it like exploring a city*\n\n• *State space* — Every possible location you could be in the city. Formally: the complete set of all possible situations an agent can be in, plus all actions to move between them.\n\n• *Frontier* — Streets you can see but haven't walked down yet. Formally: nodes discovered but not yet expanded — the boundary between explored and unexplored territory.\n\n• *Heuristic h(n)* — Your gut feeling: \"the station is maybe 10 mins that way.\" Formally: an *estimate* of the cost from node n to the goal, using domain knowledge.\n\n• *Admissible heuristic* — Your estimate never says it's *closer* than it really is. Formally: h(n) ≤ true cost for every node n. This guarantees A* finds the optimal path.\n\n• *Optimal solution* — The route with the *least total cost* among all paths from start to goal.\n\n💡 *Key exam insight:* If a heuristic overestimates, A* might skip the real shortest path!"
  },
  {
    title: "BFS vs DFS",
    q: "State TWO differences between BFS and DFS:\ni. With respect to completeness. [2]\nii. With respect to memory usage. [2]",
    a: "🔑 *Analogy: Searching for your lost keys*\n\n*BFS* = search room by room, floor by floor. You'll DEFINITELY find them.\n*DFS* = go through the ENTIRE master bedroom before moving on. Might loop forever.\n\n*(i) Completeness:*\n• BFS ✅ — Always complete. Explores depth d before d+1. If a solution exists, BFS finds it.\n• DFS ❌ — NOT always complete. In infinite or cyclic graphs, it can loop forever.\n\n*(ii) Memory Usage:*\n• BFS 💾 HIGH — O(bᵈ). Must store the entire frontier. b=10, d=6 → 1,000,000 nodes!\n• DFS 💚 LOW — O(b×m). Stores only the current path from root to node.\n\n> *b* = branching factor, *d* = depth of shallowest solution, *m* = max depth"
  },
  {
    title: "A* Search Trace",
    q: "Trace A* from S to G given:\nEdges: S→A(3), S→B(5), A→C(4), A→G(8), B→C(2), C→G(3)\nHeuristics: h(S)=7, h(A)=6, h(B)=5, h(C)=2, h(G)=0\ni. OPEN list after each expansion (show f=g+h). [5]\nii. Optimal path and total cost. [2]\niii. Verify admissibility at TWO nodes. [2]",
    a: "🗺️ *A* = Google Maps with a smart estimator*\n• g(n) = actual distance travelled so far\n• h(n) = estimated remaining distance\n• f(n) = g(n) + h(n) — always expand lowest f first\n\n*Step-by-step expansion:*\n\nStart: OPEN = [S: g=0, h=7, f=7]\n\nExpand S → add A(f=3+6=9), B(f=5+5=10)\nOPEN = [A:9, B:10]\n\nExpand A → add C(f=7+2=9), G(f=11+0=11)\nOPEN = [C:9, B:10, G:11]\n\nExpand C → add G(f=10+0=10)\nOPEN = [B:10, G(via C):10, G(via A):11]\n\nExpand B(f=10) — already have better path to C, skip.\nExpand G(via C, f=10) → GOAL!\n\n✅ *Optimal path: S → A → C → G  |  Cost = 3+4+3 = 10*\n\n*Admissibility checks:*\n• Node S: h(S)=7, true cost=10 → 7 ≤ 10 ✅\n• Node A: h(A)=6, true cost=7 → 6 ≤ 7 ✅\n• Node C: h(C)=2, true cost=3 → 2 ≤ 3 ✅\nh(n) is admissible — A* is guaranteed optimal."
  },
  {
    title: "Minimax Algorithm",
    q: "MAX plays first. Branching=2, depth=2.\n• MIN-node A leaves: 4, 7\n• MIN-node B leaves: 2, 5\ni. Show backed-up values at A, B, ROOT. [3]\nii. Optimal move for MAX and minimax value. [1]",
    a: "♟️ *Minimax = AI vs opponent, both playing perfectly*\n\n• You (MAX) want the *highest* score\n• Opponent (MIN) wants the *lowest* score\n• At MIN nodes → pick MINIMUM of children\n• At MAX nodes → pick MAXIMUM of children\n\n*Calculation:*\n\n```\n        ROOT (MAX)\n       /           \\\n    A (MIN)       B (MIN)\n    /    \\        /    \\\n   4      7      2      5\n```\n\n• MIN-node A = min(4, 7) = *4*\n• MIN-node B = min(2, 5) = *2*\n• ROOT (MAX) = max(4, 2) = *4*\n\n✅ MAX should move to *node A*. Minimax value at ROOT = *4*\n\n💡 Even though A has a 7, MAX knows MIN will always pick 4 from A — better than B's best of 2."
  },
  {
    title: "Simulated Annealing",
    q: "Current state cost=120. Neighbour cost=135. T=15.\ni. Calculate P = e^(−ΔE / T). Use e ≈ 2.718. [2]\nii. What happens to P as T→0? What does this imply? [1]",
    a: "🏔️ *Analogy: Hiking to find the lowest valley*\n\nA greedy algorithm only walks downhill — gets stuck in local valleys.\nSimulated Annealing sometimes walks *uphill* to escape and find better valleys. But it gets less adventurous as it cools.\n\n*(i) Acceptance probability:*\nΔE = 135 − 120 = 15\nP = e^(−15/15) = e^(−1) = 1/2.718 ≈ *0.368 (36.8%)*\n\nSo even though the neighbour is worse, we accept it with ~37% probability.\n\n*(ii) As T → 0:*\nΔE/T → ∞, so e^(−ΔE/T) → 0.\n\n📌 *Implication:* The algorithm becomes purely greedy — it only accepts improvements, never worse solutions. It 'freezes' into whatever local optimum it has found.\n\n💡 High T = explores freely. Low T = exploits the best found so far. This mirrors how metals cool from liquid to crystal."
  },
  {
    title: "Propositional Logic vs First-Order Logic",
    q: "Differentiate PL and FOL:\ni. Key characteristic of Propositional Logic. [1]\nii. Key characteristic of First-Order Logic. [1]\niii. One specific difference in expressiveness. [1]\niv. Role of quantifiers (∀, ∃) in FOL. [1]",
    a: "💡 *Analogy:*\n• PL = a *light switch* (TRUE or FALSE, nothing more)\n• FOL = a *full sentence with grammar* — can talk about objects and relationships\n\n*(i) Propositional Logic:*\nEvery statement is an atomic proposition with a fixed TRUE/FALSE value. No variables, no objects, no 'for all'.\nExample: `AliceIsStudent = True`\n\n*(ii) First-Order Logic (FOL):*\nCan express objects (Alice, Zimbabwe), predicates (IsStudent), and relations (CapitalOf(Harare, Zimbabwe)). Supports general rules over many objects.\nExample: `Student(Alice)`, `∀x Student(x) → MustAttend(x)`\n\n*(iii) Expressiveness difference:*\nPL needs one statement per student: `AliceMustPass`, `BobMustPass`...\nFOL covers ALL students in one line: `∀x (Student(x) → MustPass(x))`\n\n*(iv) Quantifiers:*\n• ∀ (Universal) — 'For ALL': `∀x Human(x) → Mortal(x)`\n• ∃ (Existential) — 'There EXISTS at least one': `∃x Student(x) ∧ Passes(x)`"
  },
  {
    title: "Bayes' Rule: Medical Test",
    q: "P(D)=0.02, P(+|D)=0.95, P(+|¬D)=0.06\ni. Write Bayes' Rule formula for P(D|+). [1]\nii. Calculate P(+) using Law of Total Probability. [2]\niii. Calculate P(D|+). Full working. [3]\niv. Nurse says '95% accurate → 95% chance of disease'. Why is she wrong? [2]",
    a: "🏥 *Bayes' Rule answers: given evidence, how likely is the cause?*\n\n*(i) Formula:*\nP(D|+) = P(+|D) × P(D) / P(+)\n\n*(ii) Law of Total Probability:*\nP(+) = P(+|D)×P(D) + P(+|¬D)×P(¬D)\n     = 0.95×0.02 + 0.06×0.98\n     = 0.019 + 0.0588\n     = *0.0778*\n\n*(iii) P(D|+):*\nP(D|+) = (0.95 × 0.02) / 0.0778\n       = 0.019 / 0.0778\n       ≈ *0.244 (24.4%)*\n\n*(iv) Why the nurse is wrong — Base Rate Neglect:*\nThe test IS 95% sensitive, but the disease is RARE (only 2%). Of 10,000 people:\n• ~200 actually have disease → 190 test positive (TP)\n• ~9,800 healthy → 588 false positives (FP)\nSo 190/(190+588) ≈ 24% of positives actually have the disease.\nThe nurse ignored how rare the disease is — this is *base rate neglect*."
  },
  {
    title: "Bayesian Network",
    q: "Nodes: Rain(R), Sprinkler(S), Wet Grass(W)\nP(R=T)=0.3, P(S=T|R=T)=0.1, P(S=T|R=F)=0.5\nP(W=T|S=F,R=F)=0.1, P(W=T|S=F,R=T)=0.8\ni. Chain rule factorisation of P(R,S,W). [2]\nii. Calculate P(R=T, S=F, W=T). Show full working. [4]",
    a: "🌧️ *A Bayesian Network shows cause-and-effect with probabilities*\n\nRain affects Sprinkler (people turn it off when it rains).\nBoth affect whether Grass is Wet.\n\n*(i) Chain Rule Factorisation:*\nP(R, S, W) = P(R) × P(S|R) × P(W|S, R)\n\nThis works because:\n• Rain has no parent → just P(R)\n• Sprinkler depends only on Rain → P(S|R)\n• Wet Grass depends on both → P(W|S,R)\n\n*(ii) P(R=T, S=F, W=T):*\nP(R=T) = 0.3\nP(S=F|R=T) = 1 − P(S=T|R=T) = 1 − 0.1 = 0.9\nP(W=T|S=F, R=T) = 0.8\n\nP(R=T, S=F, W=T) = 0.3 × 0.9 × 0.8 = *0.216*\n\n✅ Interpretation: There's a 21.6% chance it's raining, sprinkler is off, AND grass is wet."
  },
  {
    title: "Define a CSP",
    q: "Define a Constraint Satisfaction Problem (CSP) and state its THREE components with a brief explanation of each. [3]",
    a: "🧩 *A CSP is like solving a puzzle with rules — think Sudoku*\n\nYou have things to fill in, allowed values, and rules to obey.\n\n*Formal definition:* A CSP is a triple (X, D, C) where:\n\n• *X — Variables*: The blank boxes you need to fill.\n  Sudoku example: each empty cell in the grid.\n\n• *D — Domains*: The allowed values for each variable.\n  Sudoku example: numbers 1–9 for each cell.\n\n• *C — Constraints*: Rules all assignments must satisfy.\n  Sudoku example: no number repeats in the same row, column, or 3×3 box.\n\n✅ *A solution* = an assignment where EVERY variable has a value from its domain AND ALL constraints are satisfied."
  },
  {
    title: "Backtracking Search on a CSP",
    q: "CSP: Variables X,Y,Z | Domains {1,2,3} | Constraints: X≠Y and Y<Z\ni. Apply backtracking from X=1. Show each attempt and where backtracking occurs. [3]\nii. Write one complete valid assignment. [1]",
    a: "🔙 *Backtracking = try a path, hit a dead end, go back and try another*\n\n*Starting X=1:*\n\nX=1, try Y=1 → X≠Y violated (1=1) ❌ BACKTRACK\nX=1, try Y=2 → X≠Y ok. Now try Z=1 → Y<Z? 2<1? ❌\n              try Z=2 → Y<Z? 2<2? ❌\n              try Z=3 → Y<Z? 2<3? ✅ → SOLUTION FOUND!\n\n✅ *Valid assignment: X=1, Y=2, Z=3*\n\nOther valid solutions also exist: X=1,Y=2,Z=3 | X=2,Y=1,Z=2 etc.\n\n💡 Backtracking is depth-first search with constraint checking at each step. If a constraint is violated, we immediately prune that branch."
  },
  {
    title: "Supervised vs Unsupervised Learning",
    q: "Distinguish between supervised and unsupervised learning. Give ONE real-world example each. [2]",
    a: "🎓 *Key difference in one sentence:*\n*Supervised* = learning with an answer key.\n*Unsupervised* = finding patterns with no answer key.\n\n*Supervised Learning:*\nEvery training example has a correct label. The model learns: inputs → correct output.\nExample: *Email spam detection* — thousands of emails already labelled 'spam' or 'not spam'; model learns the pattern.\n\n*Unsupervised Learning:*\nNo labels — the model discovers its own structure.\nExample: *Customer segmentation* — a bank groups customers by spending habits without being told group names in advance.\n\n| | Supervised | Unsupervised |\n|---|---|---|\n| Labels? | Yes | No |\n| Goal | Predict outputs | Find hidden patterns |\n| Algorithms | Decision Trees, Neural Nets | K-Means, PCA |"
  },
  {
    title: "Entropy & Information Gain",
    q: "Parent node: 10 samples (6 Pos, 4 Neg)\nAttribute X splits: X=Yes → 4P,1N | X=No → 2P,3N\ni. Entropy of parent node H(S). [2]\nii. Entropy of each child node. [2]\niii. Information Gain IG(S, X). [2]\niv. Would you split on X? Justify. [1]",
    a: "📊 *Entropy = how 'messy' or mixed a group is (0=pure, 1=max mixed)*\n\n*(i) H(parent):*\nH = −(6/10)log₂(6/10) − (4/10)log₂(4/10)\n  = −0.6×(−0.737) − 0.4×(−1.322)\n  = 0.442 + 0.529\n  = *0.971 bits*\n\n*(ii) Child entropies:*\nH(X=Yes): 4P,1N → −(4/5)log₂(4/5) − (1/5)log₂(1/5)\n         = −0.8×(−0.322) − 0.2×(−2.322) = 0.258 + 0.464 = *0.722 bits*\n\nH(X=No): 2P,3N → −(2/5)log₂(2/5) − (3/5)log₂(3/5)\n        = −0.4×(−1.322) − 0.6×(−0.737) = 0.529 + 0.442 = *0.971 bits*\n\n*(iii) Information Gain:*\nIG = H(parent) − [(5/10)×H(Yes) + (5/10)×H(No)]\n   = 0.971 − [0.5×0.722 + 0.5×0.971]\n   = 0.971 − [0.361 + 0.486]\n   = 0.971 − 0.847\n   = *0.124 bits*\n\n*(iv) Should we split on X?*\nIG = 0.124 > 0, so yes — attribute X does provide some information gain. However, it's not a large gain. If other attributes have higher IG, prefer those."
  },
  {
    title: "scikit-learn Decision Tree on Iris",
    q: "Write Python using scikit-learn to:\ni. Load Iris dataset. [1]\nii. Split 80/20 with stratification, random_state=42. [2]\niii. Train a Decision Tree. [1]\niv. Print accuracy. [1]\nv. Print classification report. [1]\nvi. Print most important feature. [1]",
    a: "🌸 *What each step means:*\n\n1. *Load Iris* — 150 flower measurements (sepal/petal × length/width) + species. The 'Hello World' of ML.\n2. *Train/test split* — Like practice papers (train) vs the real exam (test). Stratification ensures equal species representation in both halves.\n3. *Train* — Decision Tree builds a flowchart of yes/no questions to separate species.\n4. *Accuracy* — % of test flowers correctly classified.\n5. *Classification report* — Precision, Recall, F1 per class.\n6. *Feature importance* — Which measurement was most useful?\n\n*Complete Python code:*\n```python\nfrom sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.metrics import accuracy_score, classification_report\n\niris = load_iris()\nX, y = iris.data, iris.target\n\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, stratify=y, random_state=42)\n\nclf = DecisionTreeClassifier(random_state=42)\nclf.fit(X_train, y_train)\n\ny_pred = clf.predict(X_test)\nprint('Accuracy:', accuracy_score(y_test, y_pred))\nprint(classification_report(y_test, y_pred, target_names=iris.target_names))\n\nbest_feature = iris.feature_names[clf.feature_importances_.argmax()]\nprint('Most important feature:', best_feature)\n```"
  },
  {
    title: "Precision, Recall & F1-Score",
    q: "TP=40, FP=10, FN=15, TN=35 (100 samples)\ni. Calculate Precision, Recall, F1-Score. Show formulas. [3]\nii. Classifier used for TB screening. Which metric to prioritise? [1]",
    a: "🏥 *Understanding TP/FP/FN/TN (TB screening context):*\n• TP=40 — sick patients correctly detected ✅\n• FP=10 — healthy people wrongly told they have TB\n• FN=15 — sick people sent home UNDETECTED ❌ DANGEROUS\n• TN=35 — healthy people correctly cleared\n\n*(i) Calculations:*\n\n*Precision* = TP / (TP+FP) = 40 / (40+10) = 40/50 = *0.80 (80%)*\n\"Of people I said were sick, 80% actually were.\"\n\n*Recall* = TP / (TP+FN) = 40 / (40+15) = 40/55 = *0.727 (72.7%)*\n\"Of all actually sick people, I caught 72.7%.\"\n\n*F1-Score* = 2 × (Precision × Recall) / (Precision + Recall)\n           = 2 × (0.80 × 0.727) / (0.80 + 0.727)\n           = 2 × 0.582 / 1.527\n           = *0.762 (76.2%)*\n\n*(ii) For TB screening → prioritise RECALL*\nA False Negative (FN) means a sick patient walks away and spreads TB. Missing a real case is far more dangerous than a false alarm (FP = unnecessary follow-up test)."
  },
  {
    title: "Overfitting & Preventing It",
    q: "d. Explain what overfitting means. [1]\ne. Describe ONE technique to prevent overfitting in a decision tree. Explain how it works. [4]",
    a: "📚 *Overfitting = the model memorised the training data instead of learning the pattern*\n\nAnalogy: A student who memorises every past exam paper word-for-word. Scores 100% on those papers — completely fails a new exam.\n\nAn overfitted model has HIGH training accuracy but LOW test accuracy (the 'generalisation gap').\n\n*Prevention technique: Pruning*\n\nPruning trims branches that learned noise rather than real patterns.\n\n*Pre-pruning (early stopping):*\nStop growing the tree before it overfits. Set max_depth=5 — it can't go deeper.\n\n*Post-pruning (reduced error pruning):*\n1. Grow the FULL tree (let it overfit)\n2. Starting from leaves, ask: 'If I cut this branch, does validation accuracy drop?'\n3. If NO → cut it (it was just memorising noise)\n4. Repeat until any cut hurts performance\n\n*Why it works:* Pruned branches reacted to random noise in training data. Simpler tree → better generalisation.\n\n*scikit-learn controls:*\n• `max_depth` — limits depth (pre-pruning)\n• `min_samples_split` — minimum samples to split a node\n• `ccp_alpha` — cost-complexity pruning (post-pruning)"
  },
  {
    title: "Neural Network Key Definitions",
    q: "Define:\ni. Activation function. [1]\nii. Backpropagation. [1]\niii. Dropout. [1]\niv. Epoch. [1]",
    a: "🧠 *Neural Network Key Definitions*\n\n*(i) Activation Function*\nDecides whether a neuron should 'fire' and how strongly.\nWithout it, stacking layers collapses to one linear equation — useless for complex patterns.\nCommon: Sigmoid (0–1), ReLU (max(0,x)), Tanh (−1 to 1)\n\n*(ii) Backpropagation*\nThe learning algorithm. Traces the error backwards through each layer to figure out 'which weights caused this mistake?' then adjusts them.\nAnalogy: You bake a salty cake. Trace back → 'I added salt in step 3' → use less next time.\nTechnically: applies the chain rule of calculus to compute ∂Loss/∂weight for every weight.\n\n*(iii) Dropout*\nDuring training, randomly 'switch off' some neurons at each step to prevent over-reliance on any single neuron.\nAnalogy: A sports team where random players sit out training — every player develops their own skills.\nEffect: Significantly reduces overfitting. At test time, all neurons are active.\n\n*(iv) Epoch*\nOne complete pass through the ENTIRE training dataset.\nAnalogy: Reading a textbook once = 1 epoch. Typically you train for many epochs until the model converges."
  },
  {
    title: "Manual Forward Pass & Backpropagation",
    q: "Network: x₁=0.5, x₂=0.8 | w₁=0.4, w₂=0.6, b₁=0.1 (sigmoid) | w₃=0.9, b₂=0.0 (sigmoid) | y=1.0 | L=½(y−ŷ)²\ni. Compute z₁ = w₁x₁ + w₂x₂ + b₁ [1]\nii. Compute h = σ(z₁) step by step [2]\niii. Compute z₂, ŷ = σ(z₂) [2]\niv. Compute loss L [1]\nv. Compute ∂L/∂w₃ and updated w₃ (α=0.1) [1]",
    a: "⚙️ *Forward Pass:*\n\n*(i) z₁:*\nz₁ = w₁x₁ + w₂x₂ + b₁\n   = 0.4×0.5 + 0.6×0.8 + 0.1\n   = 0.2 + 0.48 + 0.1 = *0.78*\n\n*(ii) h = σ(z₁):*\nσ(0.78) = 1 / (1 + e^(−0.78))\ne^(−0.78) ≈ 2.718^(−0.78) ≈ 0.4584\nh = 1 / (1 + 0.4584) = 1 / 1.4584 ≈ *0.686*\n\n*(iii) z₂ and ŷ:*\nz₂ = w₃×h + b₂ = 0.9×0.686 + 0.0 = *0.617*\nŷ = σ(0.617) = 1/(1+e^(−0.617)) ≈ 1/(1+0.5396) ≈ *0.649*\n\n*(iv) Loss L:*\nL = ½(y − ŷ)² = ½(1.0 − 0.649)² = ½(0.351)² = ½×0.123 ≈ *0.0615*\n\n*(v) Backprop for w₃:*\n∂L/∂ŷ = −(y − ŷ) = −(1.0 − 0.649) = −0.351\n∂ŷ/∂z₂ = ŷ(1−ŷ) = 0.649×0.351 = 0.228\n∂z₂/∂w₃ = h = 0.686\n∂L/∂w₃ = −0.351 × 0.228 × 0.686 ≈ *−0.0549*\nw₃_new = 0.9 − 0.1×(−0.0549) = *0.9055*"
  },
  {
    title: "CNN Architecture",
    q: "Describe a CNN for classifying 28×28 grayscale images into 10 digit classes. For each layer state purpose:\ni. Input layer [1]  ii. Convolutional layer [1]  iii. Pooling layer [1]  iv. Flatten layer [1]  v. Output layer [1]",
    a: "🖼️ *CNN = AI that sees images like your eyes do (edges → shapes → objects)*\n\nA regular neural net treats an image as a flat list of pixels — no sense of spatial structure. A CNN learns local patterns.\n\n*(i) Input Layer (28×28×1):*\nRaw pixel values normalised to [0,1]. The ×1 = 1 grayscale channel (vs ×3 for RGB).\n\n*(ii) Convolutional Layer (e.g. 32 filters, 3×3):*\n32 small filters slide across the image detecting patterns (edges, curves, textures). Each filter produces a feature map. Activation: ReLU.\n\n*(iii) Pooling Layer (MaxPool 2×2):*\nDownsamples each feature map by half (keeps strongest signal in 2×2 window). Makes features position-invariant and reduces computation.\n\n*(iv) Flatten Layer:*\nUnrolls 2D feature maps into a 1D vector so it can connect to standard Dense layers.\n\n*(v) Output Layer (Dense 10, Softmax):*\n10 neurons — one per digit (0–9). Softmax converts raw scores to probabilities summing to 1.0. Predicted digit = highest probability.\n\n*Full Architecture: Input(28×28×1) → Conv2D(32) → MaxPool → Conv2D(64) → MaxPool → Flatten → Dense(128,ReLU) → Dense(10,Softmax)*"
  },
  {
    title: "TensorFlow/Keras MNIST Neural Network",
    q: "Write Python code with TensorFlow/Keras:\ni. Load MNIST, normalise to [0,1]. [1]\nii. Build Sequential: Flatten→Dense(128,relu)→Dense(10,softmax). [2]\niii. Compile: sparse_categorical_crossentropy, adam. [1]\niv. Train 5 epochs, validation_split=0.1. [2]\nv. Evaluate test accuracy. [2]\nvi. Inline comment explaining why softmax. [1]",
    a: "🔢 *MNIST = 70,000 handwritten digit images (0–9), 28×28px — the ML 'Hello World'*\n\n*Why normalise?* Raw pixels 0–255 cause unstable gradients. Dividing by 255 squashes to [0,1].\n*Why softmax?* Converts 10 raw scores to probabilities summing to 1.0. Highest = predicted digit.\n\n```python\nimport tensorflow as tf\nfrom tensorflow import keras\n\n# (i) Load and normalise\n(X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()\nX_train, X_test = X_train / 255.0, X_test / 255.0\n\n# (ii) Build model\nmodel = keras.Sequential([\n    keras.layers.Flatten(input_shape=(28, 28)),\n    keras.layers.Dense(128, activation='relu'),\n    keras.layers.Dense(10, activation='softmax')  # softmax → probabilities summing to 1\n])\n\n# (iii) Compile\nmodel.compile(\n    optimizer='adam',\n    loss='sparse_categorical_crossentropy',\n    metrics=['accuracy']\n)\n\n# (iv) Train\nmodel.fit(X_train, y_train, epochs=5, validation_split=0.1)\n\n# (v) Evaluate\ntest_loss, test_acc = model.evaluate(X_test, y_test)\nprint(f'Test accuracy: {test_acc:.4f}')\n```"
  },
  {
    title: "NLP Definitions",
    q: "Define:\ni. Word embedding. [1]\nii. Tokenization. [1]\niii. Attention mechanism. [1]\niv. Prompt engineering. [1]",
    a: "💬 *NLP Key Definitions*\n\n*(i) Word Embedding*\nGives each word a list of numbers (vector) that captures its meaning. Similar words get similar vectors — so the model 'understands' king/queen are related, or Harare/Nairobi are both African capitals.\nWithout embeddings: words are arbitrary symbols with no meaning.\nExamples: Word2Vec, GloVe, BERT embeddings.\n\n*(ii) Tokenization*\nSplits raw text into pieces (tokens) the model can process.\nWhy not whole words? Rare/unknown words can be split into known subword parts.\nExample: 'unbelievable' → ['un', '##believ', '##able']\n\n*(iii) Attention Mechanism*\nLets the model focus on the most relevant parts of the input when processing each word.\nWithout attention: every word treated equally — long-range context is lost.\nWith attention: GPT/BERT can relate 'it' to 'the trophy' 20 words earlier.\nThis is why Transformers are so powerful.\n\n*(iv) Prompt Engineering*\nThe art of writing instructions to an AI model to get the best output — without changing model weights.\nBetter prompt = better output, even with the same model.\nExample: Instead of 'Explain AI', say 'Explain AI in simple terms for a 16-year-old with no tech background'."
  },
  {
    title: "Bigram Language Model",
    q: "Sentence: 'the student studies hard and the student passes'\ni. Extract ALL unique bigrams. [2]\nii. Calculate P('passes'|'student') and P('hard'|'studies') using MLE. Show counts. [1]\niii. What problem arises with unseen bigrams? Name ONE smoothing technique. [2]",
    a: "📝 *Bigram model: predict next word based on the previous word*\nAutocomplete on your phone works like this!\n\n*(i) All unique bigrams:*\n(the,student), (student,studies), (studies,hard), (hard,and), (and,the), (the,student) [seen], (student,passes)\n\nUnique bigrams: *(the,student), (student,studies), (studies,hard), (hard,and), (and,the), (student,passes)*\n\n*(ii) MLE calculations:*\nMLE formula: P(w₂|w₁) = Count(w₁,w₂) / Count(w₁)\n\n'student' appears 2 times.\nC(student, passes) = 1\nP('passes'|'student') = 1/2 = *0.5*\n\n'studies' appears 1 time.\nC(studies, hard) = 1\nP('hard'|'studies') = 1/1 = *1.0*\n\n*(iii) Zero probability problem:*\nIf 'student fails' never appeared in training: P('fails'|'student')=0.\nMultiplying any sentence probability by 0 gives 0 — the sentence is called 'impossible' even if it makes sense!\n\n*Fix: Laplace (Add-1) Smoothing*\nP(w₂|w₁) = [C(w₁,w₂) + 1] / [C(w₁) + V]\nwhere V = vocabulary size.\nThis gives every bigram at least a tiny non-zero probability."
  },
  {
    title: "Q-Learning",
    q: "States {s₀,s₁,s₂}, Q-table all zeros. α=0.5, γ=0.9\nStep 1: s₀→a₀→s₁, r=−1\nStep 2: s₁→a₀→s₂, r=+10\ni. Q-learning update for Step 1. [2]\nii. Q-learning update for Step 2. [3]\niii. Draw updated Q-table. [1]\niv. Explain exploration-exploitation trade-off and ε-greedy. [1]",
    a: "🤖 *Q-Learning = AI learns by trial and error (like a rat learning a maze)*\n\nQ(s,a) = expected long-term reward for taking action a from state s.\nUpdate rule: Q(s,a) ← Q(s,a) + α[r + γ·max Q(s′,a′) − Q(s,a)]\n\n*(i) Step 1: s₀→a₀→s₁, r=−1:*\nQ(s₀,a₀) = 0 + 0.5×[−1 + 0.9×max Q(s₁,·) − 0]\nmax Q(s₁,·) = 0 (all zeros)\nQ(s₀,a₀) = 0 + 0.5×[−1 + 0 − 0]\nQ(s₀,a₀) = *−0.5*\n\n*(ii) Step 2: s₁→a₀→s₂, r=+10:*\nQ(s₁,a₀) = 0 + 0.5×[10 + 0.9×max Q(s₂,·) − 0]\ns₂ is goal state, max Q(s₂,·) = 0\nQ(s₁,a₀) = 0 + 0.5×[10 + 0 − 0]\nQ(s₁,a₀) = *5.0*\n\n*(iii) Updated Q-table:*\n| State | Action a₀ |\n|---|---|\n| s₀ | −0.5 |\n| s₁ | 5.0 |\n| s₂ | 0 (goal) |\n\n*(iv) Exploration vs Exploitation:*\n• Exploitation: always pick the best known action (greedy). May miss better paths.\n• Exploration: try random actions to discover new rewards.\n• ε-greedy: with probability ε, pick random; with probability (1−ε), pick best known. Start high ε, decay over time."
  },
  {
    title: "AI Bias: Student Loan Approval",
    q: "AI rejects 35% more rural students than urban students with similar academic profiles.\ni. Name the type of bias. [1]\nii. ONE likely source of bias in training data. [1]\niii. ONE pre-processing technique to reduce bias. Explain specifically. [2]\niv. Why removing the rural/urban feature may NOT be enough? (proxy variables) [1]",
    a: "⚖️ *AI Bias in Zimbabwe Loan Approval*\n\n*(i) Type of bias:*\n*Disparate impact bias* (also called algorithmic discrimination or historical bias).\nThe model systematically disadvantages rural students even with equal academic profiles.\n\n*(ii) Source in training data:*\n*Historical discrimination embedded in labels.*\nIf past human loan officers (consciously or not) approved urban applications at higher rates, the model learns 'rural → likely reject' — because that's what the historical data shows, even though it's unfair.\n\n*(iii) Pre-processing technique: Oversampling / Re-weighting*\nOversample approved applications from rural students in the training set, OR assign higher weights to rural approved examples during training.\nThis forces the model to treat rural approvals as equally important, reducing the learned bias.\n\n*(iv) Why removing 'rural/urban' is NOT enough — Proxy Variables:*\nProxy variables are features NOT the protected attribute themselves but strongly correlated with it.\nExample: School name, phone number prefix, postal code, or internet access are all correlated with rural/urban location.\nThe model learns to discriminate through these proxies even without the original feature.\nThis is called 'fairness through blindness' — it doesn't work. You must actively measure and correct disparate outcomes."
  },
  {
    title: "Retrieval-Augmented Generation (RAG)",
    q: "Ministry of Health AI must answer using guidelines updated every quarter.\ni. Define RAG. [1]\nii. ONE advantage of RAG over fine-tuning for this use case. [2]\niii. ONE limitation of standard LLMs that RAG addresses. [1]",
    a: "📚 *RAG = giving the AI a textbook to look things up in, right when it needs to answer*\n\n*(i) Definition:*\nRAG (Retrieval-Augmented Generation) is a technique where, before generating an answer, the AI:\n1. *Retrieves* relevant documents from an up-to-date knowledge base\n2. *Reads* those documents as context\n3. *Generates* an answer grounded in what it just retrieved\n\n*(ii) RAG vs Fine-tuning for Ministry of Health:*\nFine-tuning requires: collecting new guidelines as training data → paying for GPU compute → weeks of work → done every quarter.\nRAG requires: upload new guidelines PDF to document store → done in minutes, no retraining.\n\nSince guidelines change quarterly, fine-tuning is impractical and expensive. RAG keeps the AI accurate with minimal ongoing effort. ✅\n\n*(iii) LLM limitation that RAG addresses:*\n*Knowledge cutoff / static knowledge problem.*\nStandard LLMs are trained once and frozen — they have no knowledge of anything after their training cutoff date.\nRAG fetches knowledge at inference time rather than baking it into model weights, keeping answers current."
  }
]

// ─────────────────────────────────────────────────────────────────────────────
//  TOPIC SECTIONS (for navigation)
// ─────────────────────────────────────────────────────────────────────────────

const aiTopics = [
    { name: 'Search Algorithms & Game Trees', questions: [1, 2, 3, 4, 5] },
    { name: 'Logic, Probability & CSP',       questions: [6, 7, 8, 9, 10] },
    { name: 'Machine Learning',               questions: [11, 12, 13, 14, 15] },
    { name: 'Neural Networks & Deep Learning',questions: [16, 17, 18, 19] },
    { name: 'NLP, RL & AI Ethics',            questions: [20, 21, 22, 23, 24] },
]

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER
// ─────────────────────────────────────────────────────────────────────────────

function formatQuestion(index) {
    const q = aiQuestions[index - 1]
    if (!q) return null
    const total = aiQuestions.length
    return (
        `📖 *IIT 4203 AI — Question ${index}/${total}*\n` +
        `${'─'.repeat(30)}\n\n` +
        `🎯 *${q.title}*\n\n` +
        `❓ *EXAM QUESTION:*\n${q.q}\n\n` +
        `${'─'.repeat(30)}\n` +
        `✅ *ANSWER:*\n${q.a}\n\n` +
        `${'─'.repeat(30)}\n` +
        `⬅️ .q ${index > 1 ? index - 1 : total}  |  ➡️ .q ${index < total ? index + 1 : 1}  |  📋 .qtopics`
    )
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORTED COMMANDS
// ─────────────────────────────────────────────────────────────────────────────

export const schoolCommands = {

    // ── Exam Timetable ────────────────────────────────────────────────────────

    exams: async ({ sock, from, msg }) => {
        const now = new Date()
        let text = `📚 *FINAL EXAM TIMETABLE*\n${'─'.repeat(30)}\n\n`

        let upcoming = 0
        for (const exam of exams) {
            const examDateTime = new Date(`${exam.date}T${exam.time.includes('PM') ? String(parseInt(exam.time) + 12).padStart(2,'0') : String(parseInt(exam.time)).padStart(2,'0')}:00:00`)
            const done = examDateTime < now
            const countdown = getCountdown(exam.date, exam.time)
            const dateObj = new Date(exam.date)
            const dateStr = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

            text += done
                ? `~~${dateStr} | ${exam.time}~~\n✅ ${exam.subject} — Done\n\n`
                : `📅 *${dateStr}* | 🕐 ${exam.time}\n📖 *${exam.subject}*\n📍 Venue: ${exam.venue}\n${countdown}\n\n`

            if (!done) upcoming++
        }

        text += `─`.repeat(30)
        text += `\n\n📊 *${upcoming} exam(s) remaining*`
        text += `\n\n🤖 Study AI: .q 1  |  Topics: .qtopics`

        await sock.sendMessage(from, { text }, { quoted: msg })
    },

    nextexam: async ({ sock, from, msg }) => {
        const now = new Date()

        for (const exam of exams) {
            const hour = exam.time.includes('PM') ? parseInt(exam.time) + 12 : parseInt(exam.time)
            const examDateTime = new Date(`${exam.date}T${String(hour).padStart(2,'0')}:00:00`)

            if (examDateTime > now) {
                const countdown = getCountdown(exam.date, exam.time)
                const dateObj = new Date(exam.date)
                const dateStr = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

                const text = `🎯 *NEXT EXAM*\n${'─'.repeat(25)}\n\n📖 *${exam.subject}*\n📅 ${dateStr}\n🕐 ${exam.time}\n📍 Venue: ${exam.venue}\n\n${countdown}`
                return await sock.sendMessage(from, { text }, { quoted: msg })
            }
        }

        await sock.sendMessage(from, { text: '🎉 All exams are done! You made it!' }, { quoted: msg })
    },

    today: async ({ sock, from, msg }) => {
        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]
        const todayExam = exams.find(e => e.date === todayStr)

        if (!todayExam) {
            return await sock.sendMessage(from, { text: '📅 No exam today! Rest up 😴' }, { quoted: msg })
        }

        const countdown = getCountdown(todayExam.date, todayExam.time)
        const text = `📢 *TODAY\'S EXAM*\n${'─'.repeat(25)}\n\n📖 *${todayExam.subject}*\n🕐 ${todayExam.time}\n📍 Venue: ${todayExam.venue}\n\n${countdown}\n\n💪 Good luck!`
        await sock.sendMessage(from, { text }, { quoted: msg })
    },

    countdown: async ({ sock, from, msg }) => {
        const now = new Date()
        let text = `⏳ *EXAM COUNTDOWNS*\n${'─'.repeat(25)}\n\n`

        for (const exam of exams) {
            const hour = exam.time.includes('PM') ? parseInt(exam.time) + 12 : parseInt(exam.time)
            const examDateTime = new Date(`${exam.date}T${String(hour).padStart(2,'0')}:00:00`)
            const done = examDateTime < now
            const countdown = getCountdown(exam.date, exam.time)

            text += done
                ? `✅ ${exam.subject}\n`
                : `📖 *${exam.subject}*: ${countdown}\n`
        }

        await sock.sendMessage(from, { text }, { quoted: msg })
    },

    // ── AI Study Guide ────────────────────────────────────────────────────────

    // .q or .q <number>  — Show a specific question (default: 1)
    q: async ({ sock, from, msg, args }) => {
        const num = parseInt(args?.[0]) || 1

        if (isNaN(num) || num < 1 || num > aiQuestions.length) {
            const text = `❌ Invalid question number.\nUse *.q 1* to *.q ${aiQuestions.length}* or *.qtopics* to browse by topic.`
            return await sock.sendMessage(from, { text }, { quoted: msg })
        }

        const text = formatQuestion(num)
        await sock.sendMessage(from, { text }, { quoted: msg })
    },

    // .qtopics — List all topic sections with question ranges
    qtopics: async ({ sock, from, msg }) => {
        let text = `🤖 *IIT 4203 AI — STUDY TOPICS*\n${'─'.repeat(30)}\n\n`
        text += `📚 *${aiQuestions.length} Questions Total*\n\n`

        for (const topic of aiTopics) {
            const first = topic.questions[0]
            const last = topic.questions[topic.questions.length - 1]
            text += `📌 *${topic.name}*\n`
            text += `   Questions ${first}–${last} → .q ${first}\n\n`
        }

        text += `${'─'.repeat(30)}\n`
        text += `💡 *Usage:*\n`
        text += `• *.q 1* — Show question 1\n`
        text += `• *.q 15* — Jump to question 15\n`
        text += `• *.qlist* — All question titles\n`
        text += `• *.qrandom* — Random question\n`
        text += `• *.qsearch <keyword>* — Search by keyword`

        await sock.sendMessage(from, { text }, { quoted: msg })
    },

    // .qlist — List all question titles with numbers
    qlist: async ({ sock, from, msg }) => {
        let text = `📋 *IIT 4203 AI — ALL QUESTIONS*\n${'─'.repeat(30)}\n\n`

        let topicIdx = 0
        for (let i = 0; i < aiQuestions.length; i++) {
            const num = i + 1
            // Insert topic header
            if (topicIdx < aiTopics.length && aiTopics[topicIdx].questions[0] === num) {
                text += `\n📌 *${aiTopics[topicIdx].name}*\n`
                topicIdx++
            }
            text += `  ${num}. ${aiQuestions[i].title}\n`
        }

        text += `\n${'─'.repeat(30)}\n`
        text += `💡 Type *.q <number>* to study any question.`

        await sock.sendMessage(from, { text }, { quoted: msg })
    },

    // .qrandom — Random question
    qrandom: async ({ sock, from, msg }) => {
        const num = Math.floor(Math.random() * aiQuestions.length) + 1
        const text = formatQuestion(num)
        await sock.sendMessage(from, { text }, { quoted: msg })
    },

    // .qsearch <keyword> — Search question titles and content
    qsearch: async ({ sock, from, msg, args }) => {
        const keyword = (args || []).join(' ').toLowerCase().trim()

        if (!keyword) {
            return await sock.sendMessage(from, { text: '❌ Usage: *.qsearch <keyword>*\nExample: .qsearch backpropagation' }, { quoted: msg })
        }

        const matches = aiQuestions
            .map((q, i) => ({ num: i + 1, ...q }))
            .filter(q =>
                q.title.toLowerCase().includes(keyword) ||
                q.q.toLowerCase().includes(keyword) ||
                q.a.toLowerCase().includes(keyword)
            )

        if (matches.length === 0) {
            return await sock.sendMessage(from, { text: `🔍 No results for "*${keyword}*".\nTry *.qtopics* to browse by topic.` }, { quoted: msg })
        }

        if (matches.length === 1) {
            // Only one result — show it directly
            const text = formatQuestion(matches[0].num)
            return await sock.sendMessage(from, { text }, { quoted: msg })
        }

        let text = `🔍 *Search: "${keyword}"*\n${'─'.repeat(25)}\n\n`
        text += `Found *${matches.length} result(s)*:\n\n`
        for (const m of matches) {
            text += `  ${m.num}. ${m.title}\n`
        }
        text += `\n💡 Type *.q <number>* to open any question.`

        await sock.sendMessage(from, { text }, { quoted: msg })
    },

    // .qsummary — Quick revision cheat sheet
    qsummary: async ({ sock, from, msg }) => {
        const text = `🧠 *IIT 4203 AI — QUICK REVISION CHEAT SHEET*\n${'─'.repeat(35)}\n\n` +
`🔍 *SEARCH ALGORITHMS*
• BFS: complete, O(bᵈ) memory | DFS: incomplete, O(bm) memory
• A*: f(n)=g(n)+h(n), admissible h → optimal
• Minimax: MAX picks max, MIN picks min, both play perfectly
• Simulated Annealing: P=e^(−ΔE/T), high T=explore, low T=exploit

⚖️ *LOGIC & PROBABILITY*
• PL: TRUE/FALSE only | FOL: objects, predicates, ∀∃ quantifiers
• Bayes: P(H|E) = P(E|H)·P(H) / P(E)
• Bayesian Net: P(X,Y,Z) = P(X)·P(Y|X)·P(Z|X,Y)
• CSP: (Variables, Domains, Constraints) — backtracking to solve

🤖 *MACHINE LEARNING*
• Supervised: labelled data → predict | Unsupervised: find patterns
• Entropy H = −Σpᵢlog₂pᵢ | IG = H(parent) − weighted H(children)
• Precision=TP/(TP+FP) | Recall=TP/(TP+FN) | F1=2PR/(P+R)
• Overfitting: high train, low test accuracy → fix with pruning

🧠 *NEURAL NETWORKS*
• Forward: z=Wx+b → activate → next layer
• Backprop: chain rule, ∂L/∂w → gradient descent update
• Dropout: randomly zero neurons → prevents overfitting
• CNN: Conv→Pool→Flatten→Dense | Softmax → class probabilities

💬 *NLP & RL*
• Embedding: word → vector | Attention: focus on relevant parts
• Bigram: P(w₂|w₁) = C(w₁w₂)/C(w₁) | Laplace smoothing for zeros
• Q(s,a) ← Q + α[r + γ·maxQ(s′) − Q] | ε-greedy: explore vs exploit
• RAG: retrieve docs → ground LLM answers in current knowledge
• Bias types: historical, proxy variables, disparate impact

${'─'.repeat(35)}
📖 Full questions: .q 1  |  Topics: .qtopics`

        await sock.sendMessage(from, { text }, { quoted: msg })
    },

}