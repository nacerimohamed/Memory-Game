// ------------------- ترجمة النصوص ------------------
    const translations = {
        fr: {
            title: "🧠 Jeu de Mémoire 🃏",
            sub: "✧ Retournez les cartes et trouvez les paires ✧",
            moves: "Mouvements:",
            pairs: "Paires:",
            time: "Temps:",
            reset: "🔄 Nouvelle Partie",
            winMessage: (moves, time) => `🎉🎊 Félicitations ! Vous avez complété le jeu en ${moves} mouvement(s) et ${time} 🎊🎉`,
            defaultMessage: "✨ Retournez deux cartes et trouvez la paire ! ✨",
            pairFound: (current, total) => `✨ ${current} paires trouvées sur ${total} ✨`,
            footer: "⭐ Retournez deux cartes, trouvez la paire ! ⭐"
        },
        en: {
            title: "🧠 Memory Game 🃏",
            sub: "✧ Flip the cards and find the matches ✧",
            moves: "Moves:",
            pairs: "Matches:",
            time: "Time:",
            reset: "🔄 New Game",
            winMessage: (moves, time) => `🎉🎊 Congratulations! You completed the game in ${moves} moves and ${time} 🎊🎉`,
            defaultMessage: "✨ Flip two cards and find the match! ✨",
            pairFound: (current, total) => `✨ ${current} pairs found out of ${total} ✨`,
            footer: "⭐ Flip two cards, find the match! ⭐"
        }
    };

    let currentLang = 'fr'; // langue par défaut: français

    // Mettre à jour l'interface texte
    function updateUILanguage() {
        const t = translations[currentLang];
        document.getElementById('gameTitle').textContent = t.title;
        document.getElementById('subText').textContent = t.sub;
        document.getElementById('moveLabel').textContent = t.moves;
        document.getElementById('matchLabel').textContent = t.pairs;
        document.getElementById('timerLabel').textContent = t.time;
        document.getElementById('resetGame').textContent = t.reset;
        document.querySelector('footer').textContent = t.footer;
        
        // Mettre à jour le message si la partie est en cours ou terminée
        if (matchedPairs === ICONS.length) {
            messageBox.textContent = t.winMessage(moveCounter, formatTime(timerSeconds));
        } else {
            if (matchedPairs > 0) {
                messageBox.textContent = t.pairFound(matchedPairs, ICONS.length);
            } else {
                messageBox.textContent = t.defaultMessage;
            }
        }
        
        // Mettre à jour les boutons de langue actifs
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.dataset.lang === currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // ------------------- إعدادات الرموز (8 أزواج => 16 بطاقة) ------------------
    const ICONS = [
        "🐶", "🐱", "🐭", "🐹",
        "🐰", "🦊", "🐻", "🐼"
    ];
    
    let cardsData = [];
    let gameCards = [];
    let boardElement = document.getElementById('gameBoard');
    
    let moveCounter = 0;
    let matchedPairs = 0;
    let timerSeconds = 0;
    let timerInterval = null;
    let gameActive = true;
    let lockBoard = false;
    let firstCard = null;
    let secondCard = null;
    let firstCardId = null;
    let secondCardId = null;
    
    const moveSpan = document.getElementById('moveCount');
    const matchSpan = document.getElementById('matchCount');
    const timerDisplaySpan = document.getElementById('timerDisplay');
    const messageBox = document.getElementById('messageBox');
    const resetBtn = document.getElementById('resetGame');
    
    function formatTime(sec) {
        let minutes = Math.floor(sec / 60);
        let seconds = sec % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function updateTimerUI() {
        timerDisplaySpan.textContent = formatTime(timerSeconds);
    }
    
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (gameActive && matchedPairs < ICONS.length) {
                timerSeconds++;
                updateTimerUI();
            } else if (matchedPairs === ICONS.length) {
                if (timerInterval) clearInterval(timerInterval);
                timerInterval = null;
            }
        }, 1000);
    }
    
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
    
    function incrementMove() {
        moveCounter++;
        moveSpan.textContent = moveCounter;
    }
    
    function updateMatches() {
        matchSpan.textContent = matchedPairs;
        const t = translations[currentLang];
        if (matchedPairs === ICONS.length) {
            gameActive = false;
            stopTimer();
            messageBox.textContent = t.winMessage(moveCounter, formatTime(timerSeconds));
            lockBoard = true;
        } else {
            messageBox.textContent = t.pairFound(matchedPairs, ICONS.length);
        }
    }
    
    function resetBoardState() {
        firstCard = null;
        secondCard = null;
        firstCardId = null;
        secondCardId = null;
        lockBoard = false;
    }
    
    function checkMatch(cardA, cardB, idA, idB) {
        const iconA = cardsData[idA].icon;
        const iconB = cardsData[idB].icon;
        
        if (iconA === iconB) {
            cardsData[idA].matched = true;
            cardsData[idB].matched = true;
            
            const cardElementA = gameCards[idA];
            const cardElementB = gameCards[idB];
            cardElementA.classList.add('matched');
            cardElementB.classList.add('matched');
            cardElementA.classList.add('flipped');
            cardElementB.classList.add('flipped');
            
            matchedPairs++;
            updateMatches();
            resetBoardState();
        } else {
            setTimeout(() => {
                if (cardsData[idA].matched === false && cardsData[idB].matched === false) {
                    const cardElemA = gameCards[idA];
                    const cardElemB = gameCards[idB];
                    cardElemA.classList.remove('flipped');
                    cardElemB.classList.remove('flipped');
                }
                resetBoardState();
                if (!gameActive) lockBoard = true;
                else lockBoard = false;
            }, 800);
        }
    }
    
    function onCardClick(cardIndex) {
        if (lockBoard) return;
        if (!gameActive) return;
        if (cardsData[cardIndex].matched) return;
        
        const currentCardElement = gameCards[cardIndex];
        if (currentCardElement.classList.contains('flipped')) return;
        if (firstCard !== null && secondCard !== null) return;
        
        if (moveCounter === 0 && timerInterval === null && matchedPairs === 0) {
            startTimer();
        }
        
        currentCardElement.classList.add('flipped');
        
        if (firstCard === null) {
            firstCard = currentCardElement;
            firstCardId = cardIndex;
        } else if (secondCard === null && firstCardId !== cardIndex) {
            secondCard = currentCardElement;
            secondCardId = cardIndex;
            incrementMove();
            lockBoard = true;
            checkMatch(firstCard, secondCard, firstCardId, secondCardId);
        }
    }
    
    function initGame() {
        stopTimer();
        moveCounter = 0;
        matchedPairs = 0;
        timerSeconds = 0;
        gameActive = true;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
        firstCardId = null;
        secondCardId = null;
        
        moveSpan.textContent = "0";
        matchSpan.textContent = "0";
        updateTimerUI();
        
        const t = translations[currentLang];
        messageBox.textContent = t.defaultMessage;
        
        let deck = [...ICONS, ...ICONS];
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        cardsData = deck.map((icon, idx) => ({
            icon: icon,
            matched: false,
            cardId: idx
        }));
        
        boardElement.innerHTML = "";
        gameCards = [];
        
        deck.forEach((icon, idx) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                onCardClick(idx);
            });
            
            const inner = document.createElement('div');
            inner.className = 'card-inner';
            
            const front = document.createElement('div');
            front.className = 'card-front';
            front.textContent = icon;
            
            const back = document.createElement('div');
            back.className = 'card-back';
            
            inner.appendChild(front);
            inner.appendChild(back);
            card.appendChild(inner);
            
            boardElement.appendChild(card);
            gameCards.push(card);
        });
    }
    
    function resetAndRestart() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        initGame();
        gameActive = true;
        lockBoard = false;
        const t = translations[currentLang];
        messageBox.textContent = t.defaultMessage;
    }
    
    // Changer la langue
    function setLanguage(lang) {
        if (lang === currentLang) return;
        currentLang = lang;
        updateUILanguage();
        // Mettre à jour le message sans perdre l'état du jeu
        const t = translations[currentLang];
        if (matchedPairs === ICONS.length) {
            messageBox.textContent = t.winMessage(moveCounter, formatTime(timerSeconds));
        } else if (matchedPairs > 0) {
            messageBox.textContent = t.pairFound(matchedPairs, ICONS.length);
        } else {
            messageBox.textContent = t.defaultMessage;
        }
    }
    
    // Événements pour les boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
    
    resetBtn.addEventListener('click', () => {
        resetAndRestart();
    });
    
    initGame();
    updateUILanguage();