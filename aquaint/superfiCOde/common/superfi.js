const _ = require("lodash");
const CARD_FIX_MIN_MONTHLY_AMOUNT = 25;

const avalancheCalculation = function (availableBalance, cardsAccounts) {
    return new Promise(async (resolve, reject) => {
        try {
            let totalDebt = 0
            let totalInterest = 0
            let totalMonths = 0
            let toPayOffCards = JSON.parse(JSON.stringify(_.sortBy(cardsAccounts, 'interest_rate').reverse()));
            // Calculate the first month debt
            toPayOffCards.forEach((card) => (totalDebt += card.current_balance))

            // At this point, we know the user has enough cash to pay off the minimum payment towards all cards and accounts or alteast £25
            // Left over will be paid towards the higest interest_rate card
            while (totalDebt > 0) {
                let totalMonthlyDebtPaid = 0 // To keep track of the monthly balance available towards debt
                totalMonths += 1
                let cardInterests = []
                totalDebt = Math.floor(totalDebt)

                // Pay all cards and accounts minimum payments.
                await Promise.all(toPayOffCards.map(async (card) => {
                    // Calculate card min monthly and interest every iteration.
                    const balance = Number.parseFloat(card.current_balance.toString().replace(/[^0-9\.]+/g, ''))
                    const interest_rate = card.interest_rate ? +card.interest_rate : 0
                    var interest = +(balance * (interest_rate / 100 / 12)).toFixed(2)
                    var minMonthly = +(0.03 * balance).toFixed(2)
                    if (balance < CARD_FIX_MIN_MONTHLY_AMOUNT) { minMonthly = balance; interest = 0; }
                    if (minMonthly < CARD_FIX_MIN_MONTHLY_AMOUNT) { minMonthly = CARD_FIX_MIN_MONTHLY_AMOUNT; }

                    cardInterests.push(interest)
                    if (card.current_balance > 0) {
                        const MONTHLY_PAYMENT = minMonthly
                        // Pays.
                        card.current_balance -= MONTHLY_PAYMENT
                        card.suggestedBalance = MONTHLY_PAYMENT
                        totalDebt -= MONTHLY_PAYMENT
                        totalMonthlyDebtPaid += MONTHLY_PAYMENT // Add interest to total monthly debt.
                    }
                })).then(async () => {
                    let leftOverBalance = +(availableBalance - totalMonthlyDebtPaid).toFixed(2)
                    let counter = -1
                    // Pay cards and accounts with left over balance.
                    for (let card of toPayOffCards) {
                        counter += 1
                        if (card.current_balance <= 0) {
                            continue
                        }
                        const interestAdded = cardInterests[counter];
                        // Pay left over balance to high interest card.
                        if (leftOverBalance < card.current_balance) {
                            card.current_balance -= +leftOverBalance.toFixed(2)
                            card.current_balance += +interestAdded.toFixed(2)
                            card.suggestedBalance = +(card.suggestedBalance ? card.suggestedBalance + leftOverBalance : leftOverBalance).toFixed(2)
                            totalDebt -= +leftOverBalance.toFixed(2)
                            totalDebt += +interestAdded.toFixed(2)

                            totalInterest += interestAdded
                            leftOverBalance = 0
                            break
                        }
                        // Left over balance is more than needed for this card.
                        if (leftOverBalance >= card.current_balance) {
                            card.suggestedBalance = +(card.suggestedBalance ? card.suggestedBalance + card.current_balance : leftOverBalance).toFixed(2)
                            leftOverBalance -= +card.current_balance.toFixed(2)
                            totalDebt -= +card.current_balance.toFixed(2)

                            card.current_balance = 0
                            continue
                        }
                    }
                })
                if (typeof numberOfMonths === 'number' && numberOfMonths === 1) {
                    break
                }
                if (totalMonths === 5000) {
                    break
                }
            }
            resolve({ status: true, data: { totalMonths, totalInterest: +totalInterest.toFixed(2), cards_accounts: toPayOffCards } });
        } catch (err) {
            resolve({ status: false, message: err?.message || 'Avalanche method not calculated.' });
        };
    });
}

const snowballCalculation = function (availableBalance, cardsAccounts) {
    return new Promise(async (resolve, reject) => {
        try {
            let totalDebt = 0
            let totalInterest = 0
            let totalMonths = 0
            let toPayOffCards = JSON.parse(JSON.stringify(_.sortBy(cardsAccounts, 'current_balance')));

            // Calculate the first month debt.
            toPayOffCards.forEach((card) => (totalDebt += card.current_balance))

            while (totalDebt > 0) {
                let totalMonthlyDebtPaid = 0 // To keep track of the monthly balance available towards debt.
                totalMonths += 1
                let cardInterests = []
                totalDebt = Math.floor(totalDebt)

                await Promise.all(toPayOffCards.map(async (card) => {
                    // Calculate card min monthly and interest every iteration.
                    const balance = Number.parseFloat(card.current_balance.toString().replace(/[^0-9\.]+/g, ''))
                    const interest_rate = card.interest_rate ? +card.interest_rate : 0
                    var interest = +(balance * (interest_rate / 100 / 12)).toFixed(2)
                    var minMonthly = +(0.03 * balance).toFixed(2)
                    if (balance < CARD_FIX_MIN_MONTHLY_AMOUNT) { minMonthly = balance; interest = 0; }
                    if (minMonthly < CARD_FIX_MIN_MONTHLY_AMOUNT) { minMonthly = CARD_FIX_MIN_MONTHLY_AMOUNT; }

                    cardInterests.push(interest)
                    if (card.current_balance > 0) {
                        const MONTHLY_PAYMENT = minMonthly
                        // Pays.
                        card.current_balance -= MONTHLY_PAYMENT
                        card.suggestedBalance = MONTHLY_PAYMENT
                        totalDebt -= MONTHLY_PAYMENT
                        totalMonthlyDebtPaid += MONTHLY_PAYMENT // Add interest to total monthly debt.
                    }
                })).then(async () => {
                    let leftOverBalance = +(availableBalance - totalMonthlyDebtPaid).toFixed(2)
                    let counter = -1
                    for (let card of toPayOffCards) {
                        counter += 1
                        if (card.current_balance <= 0) {
                            continue
                        }
                        const interestAdded = cardInterests[counter]
                        // Pay left over balance to high balance card.
                        if (leftOverBalance < card.current_balance) {
                            card.current_balance -= +leftOverBalance.toFixed(2)
                            card.current_balance += +interestAdded.toFixed(2)
                            card.suggestedBalance = +(card.suggestedBalance ? card.suggestedBalance + leftOverBalance : leftOverBalance).toFixed(2)
                            totalDebt -= +leftOverBalance.toFixed(2)
                            totalDebt += +interestAdded.toFixed(2)

                            totalInterest += interestAdded
                            leftOverBalance = 0
                            break
                        }
                        // Left over balance is more than needed for this card.
                        if (leftOverBalance >= card.current_balance) {
                            card.suggestedBalance = +(card.suggestedBalance ? card.suggestedBalance + card.current_balance : leftOverBalance).toFixed(2)
                            leftOverBalance -= +card.current_balance.toFixed(2)
                            totalDebt -= +card.current_balance.toFixed(2)

                            card.current_balance = 0
                            continue
                        }
                    }
                })
                if (typeof numberOfMonths === 'number' && numberOfMonths === 1) {
                    break
                }
                if (totalMonths === 5000) {
                    break
                }
            }
            resolve({ status: true, data: { totalMonths, totalInterest: +totalInterest.toFixed(2), cards_accounts: toPayOffCards } })
        } catch (err) {
            resolve({ status: false, message: err?.message || 'Snowball method not calculated.' });
        };
    });
}

const nonSuperfiCalculation = async function (cardsAccounts) {
    return new Promise(async (resolve, reject) => {
        try {
            let totalDebt = 0
            let totalMonths = 0
            let totalInterest = 0

            var toPayOffCards = JSON.parse(JSON.stringify(cardsAccounts));

            // First month total debt
            toPayOffCards.forEach((card) => {
                totalDebt += card.current_balance
            })
            while (totalDebt > 0) {
                if (totalMonths === 10000) {
                    break
                }
                totalMonths += 1
                toPayOffCards.forEach((card) => {
                    const balance = Number.parseFloat(card.current_balance.toString().replace(/[^0-9\.]+/g, ''))
                    const interest_rate = card.interest_rate ? +card.interest_rate : 0
                    var interest = +(balance * (interest_rate / 100 / 12)).toFixed(2)
                    var minMonthly = +(0.03 * balance).toFixed(2)
                    if (balance < CARD_FIX_MIN_MONTHLY_AMOUNT) { minMonthly = balance; interest = 0; }
                    if (minMonthly < CARD_FIX_MIN_MONTHLY_AMOUNT) { minMonthly = CARD_FIX_MIN_MONTHLY_AMOUNT; }

                    if (card.current_balance > 0) {
                        // To track of the interest.
                        totalInterest += interest
                        // Deduct min payment from total debt.
                        totalDebt = +(totalDebt - minMonthly).toFixed(2)
                        // Deduct min payment from this card.
                        card.current_balance = +(card.current_balance - minMonthly).toFixed(2)
                    }
                })
            }
            resolve({ status: true, data: { totalMonths, totalInterest: +totalInterest.toFixed(2) } })
        } catch (err) {
            resolve({ status: false, message: err?.message || 'Timeout of debt not calculated.' });
        };
    });
}

module.exports = {
    avalancheCalculation,
    snowballCalculation,
    nonSuperfiCalculation
}