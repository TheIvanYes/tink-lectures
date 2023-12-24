let _dom_loaded = false;
let _data = null;

document.addEventListener('DOMContentLoaded', function () {
    _dom_loaded = true;
    buildStandings();
});

(function () {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/standings_data/' + standings_label, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        let status = xhr.status;
        if (status === 200) {
            _data = xhr.response;
            buildStandings();
        } else {
            loadFailed();
        }
    };
    xhr.send();
})();

var addCell = function (row, text, klass, rowSpan, colSpan) {
    let cell = row.insertCell();
    cell.innerHTML = text;
    cell.className = klass || '';
    cell.rowSpan = rowSpan || 1;
    cell.colSpan = colSpan || 1;
    return cell;
};

var loadFailed = function () {
    alert('Не удалось получить таблицу результатов!');
};

var compareUsers = function (a, b) {
    if (a['mark'] !== b['mark']) {
        return b['mark'] - a['mark'];
    }
    if (a['score'] !== b['score']) {
        return b['score'] - a['score'];
    }
    if (a['penalty'] !== b['penalty']) {
        return a['penalty'] - b['penalty'];
    }
    return a['name'].localeCompare(b['name']);
};

var getMarkColor = function (score, coeff) {
    score = Math.min(score, 10);
    let red = parseInt(240 + (144 - 240) * Math.sqrt(score / 10));
    let green = parseInt(128 + (238 - 128) * Math.sqrt(score / 10));
    let blue = parseInt(128 + (144 - 128) * Math.sqrt(score / 10));
    return 'rgb(' + red + ',' + green + ',' + blue + ')';
};

var defaultContestMark = function (total_score, problem_score, olymp) {
    return (problem_score !== 0 ? total_score / problem_score * 10 : 0.0);
};

var olympContestMark = function (total_score, problem_score, max_possible_score) {
    let problems = problem_score.length;
    return (problems !== 0 ? total_score / max_possible_score * 10 : 0.0);
}

var notOlympContestMark = function (total_score, problem_score) {
    let problems = problem_score.length;
    let max_possible_score = problems;
    return (problems !== 0 ? total_score / max_possible_score : 0.0);
};

var sqrtContestMark = function (total_score, problem_score) {
    let problems = problem_score.length;
    return (problems !== 0 ? Math.sqrt(total_score / problems) * 10 : 0.0);
};

var relativeContestMark = function (
    total_score,        // суммарный балл за контест
    problem_score,      // массив баллов за задачи
    problem_max_score,  // массив максимальных набранных баллов за задачи
    total_users,        // общее количество участников
    problem_accepted,   // массив количества ОК по задаче
    max_score           // максимальный набранный балл за контест
) {
    let problems = problem_score.length;
    if (max_score === 0) {
        return 0;
    } else {
        return total_score / max_score * 10;
    }
};

var useOldContestMark = function (total_scores, user_id, olymp) {
    let total_score = 0;
    let problem_score = new Array(total_scores[0].length).fill(0.0);

    let problem_max_score = new Array(total_scores[0].length).fill(0.0);
    let problem_accepted = new Array(problem_score.length).fill(0);
    let max_score = 0;

    let pr_max = 0;

    if (!olymp) {
        for (let i = 0; i < total_scores.length; i++) {
            for (let j = 0; j < problem_score.length; j++) {
                problem_score[j] += total_scores[i][j]['score'];
            }
        }

        for (let j = 0; j < problem_score.length; j++) {
            if (problem_score[j] > 0) {
                problem_max_score[j] += 1.0 / Math.sqrt(problem_score[j]);
            }
        }

        for (let j = 0; j < problem_score.length; j++) {
            if (total_scores[user_id][j]['score'] > 0) {
                total_score += problem_max_score[j];
            }
            pr_max += problem_max_score[j];
        }
    } else {
        pr_max = 100 * problem_score.length;
        for (let j = 0; j < problem_score.length; j++) {
            total_score += total_scores[user_id][j]['score'];
        }
    }

    return calculateContestMark(
        olymp,
        total_score,
        pr_max,
        problem_max_score,
        total_scores.length,
        problem_accepted,
        max_score);
};

var defaultTotalMark = function (marks, coefficients) {
    let mean_mark_t = 0;
    let total_coef_t = 0;
    let mean_mark_d = 0;
    let total_coef_d = 0;
    for (let i = 0; i < marks.length; i++) {
        let coef = 1.0;
        if (contest_id === -1) {
            coef = coefficients[i];
        }
        if (marks[i][1]) {
            mean_mark_d += marks[i][0] * coef;
            total_coef_d += coef;
        } else {
            mean_mark_t += marks[i][0] * coef;
            total_coef_t += coef;
        }
    }
    if (total_coef_t > 0) {
        mean_mark_t /= total_coef_t;
    }
    if (total_coef_d > 0) {
        mean_mark_d /= total_coef_d;
    }
    return [mean_mark_t, mean_mark_d];
};

var blitzMark = function (problem_score, problem_accepted, total_users) {
    let mark = 0;
    for (let i = 0; i < problem_score.length; i++) {
        if (problem_score[i] > 0) {
            mark += total_users / (problem_score[i] * problem_accepted[i]);
        }
    }
    return mark
};

// возвращает единственное число -- оценку за контест
var calculateContestMark = function (
    olymp,
    total_score,        // суммарный балл за контест
    problem_score,      // массив баллов за задачи
    problem_max_score,  // массив максимальных набранных баллов за задачи
    total_users,        // общее количество участников
    problem_accepted,   // массив количества ОК по задаче
    max_score           // максимальный набранный балл за контест
) {
    return defaultContestMark(total_score, problem_score, olymp);
};

var calculateContestMark_ap22 = function (
    olymp,
    total_score,        // суммарный балл за контест
    problem_score,      // массив баллов за задачи
    problem_max_score,  // массив максимальных набранных баллов за задачи
    total_users,        // общее количество участников
    problem_accepted,   // массив количества ОК по задаче
    max_score           // максимальный набранный балл за контест
) {
    if (olymp) {
        return olympContestMark(total_score, problem_score, max_score);
    }
    else {
        return notOlympContestMark(total_score, problem_score);
    }
}

var newCalculateContestMark = function (
    olymp,
    total_scores,       // двумерный массив пар балла и времени сдачи задач пользователями
    user_id,            // номер пользователя
    contest_info        // информация о контесте
) {
    return useOldContestMark(total_scores, user_id, olymp)
};

var calculateTotalMark = function (
    marks,              // массив оценок за контесты
    coefficients,       // массив коэффициентов контестов
    total_score,        // суммарный балл за все контесты
    contest_score,      // массив баллов за контесты
    contest_max_score,  // массив максимальных набранных баллов за контесты
    problem_score,      // двумерный массив набранных баллов за задачи
    problem_max_score,  // двумерный массив максимальных набранных баллов за задач
    total_users,        // общее количество участников
    problem_accepted    // двумерный массив количества ОК по задаче
) {
    return defaultTotalMark(marks, coefficients);
};

var calculateTotalMark_ap22 = function (
    olymp,
    marks,              // массив оценок за контесты
    coefficients,       // массив коэффициентов контестов
    total_score,        // суммарный балл за все контесты
    contest_score,      // массив баллов за контесты
    contest_max_score,  // массив максимальных набранных баллов за контесты
    problem_score,      // двумерный массив набранных баллов за задачи
    problem_max_score,  // двумерный массив максимальных набранных баллов за задач
    total_users,        // общее количество участников
    problem_accepted    // двумерный массив количества ОК по задаче
) {
    if (olymp) {
        return defaultTotalMark(marks, coefficients);
    }
    else {
        return 10 * Math.sqrt(defaultTotalMark(marks, coefficients));
    }
};

var calculateMark = function (users, contests) {
    let coefficients = [];
    let problem_max_score = [];
    let problem_accepted = [];
    let total_scores = {};
    contests.forEach(function (contest, i) {
        total_scores[i] = [];
        problem_max_score.push([]);
        problem_accepted.push([]);
        coefficients.push(contest['coefficient']);
        contest['problems'].forEach(function (problem, j) {
            problem_max_score[i].push(0);
            problem_accepted[i].push(0);
        });
    });

    let user_total_score = {};
    let user_problem_score = {};
    users.forEach(function (user) {
        let id = user['id'];
        user_total_score[id] = 0;
        user_problem_score[id] = [];
        user['marks'] = [];
        user['scores'] = [];
        contests.forEach(function (contest, c_id) {
            let total_score = 0;
            user_problem_score[id].push([]);
            total_scores[c_id].push(contest['users'][id].slice(0));
            contest['users'][id].forEach(function (result, p_id) {
                let score = result['score'];
                let is_accepted = false;
                if (score > 0) {
                    is_accepted = true;
                }
                total_score += score;
                problem_max_score[c_id][p_id] = Math.max(problem_max_score[c_id][p_id], score);
                problem_accepted[c_id][p_id] += (+is_accepted);
                user_problem_score[id][c_id].push(score);
            });

            user['scores'].push(total_score);
            user_total_score[id] += total_score;
        });
    });

    users.forEach(function (user, u_id) {
        let id = user['id'];
        user['marks'] = [];
        contests.forEach(function (contest, c_id) {
            user['marks'].push([newCalculateContestMark(
                contest['title'][0] === 'D',
                total_scores[c_id],
                u_id,
                contest["contest_info"]
            ), contest['title'][0] === 'D']);
        });
        let mark = calculateTotalMark(
            user['marks'],
            coefficients,
            user_total_score[id],
            user_problem_score[id],
            problem_max_score,
            users.length,
            problem_accepted
        );
        user['contests'] = mark[0];
        user['distants'] = mark[1];

        let exist_t = 0;
        let exist_b = 0;
        contests.forEach(function (contest, c_id) {
            if (contest['title'][0] === 'D') {
                exist_b = 1;
            }
            if (contest['title'][0] === 'T') {
                exist_t = 1;
            }
        });
        if (exist_b == 0) {
            user['mark'] = mark[0];
        } else if (exist_t == 0) {
            user['mark'] = mark[1];
        } else {
            user['mark'] = mark[0] * 0.5 + mark[1] * 0.5;
        }
    });
};


var calculateInformation = function (users, contests) {
    users.forEach(function (user) {
        let id = user['id'];
        user['solved'] = 0;
        user['summary'] = 0;
        user['submissions'] = 0;

        contests.forEach(function (contest) {
            contest['users'][id].forEach(function (result) {
                if (contest['title'][0] === 'T') {
                    user['solved'] += result['score'];
                } else if (contest['title'][0] === 'D') {
                    user['summary'] += result['score'];
                }
                user['submissions'] += result['penalty'];
            });
        });
    });
};

var getScoreColor = function (score) {
    score = Math.min(score, 100);
    let red = parseInt(240 + (144 - 240) * Math.sqrt(score / 100));
    let green = parseInt(128 + (238 - 128) * Math.sqrt(score / 100));
    let blue = parseInt(128 + (144 - 128) * Math.sqrt(score / 100));
    return 'rgb(' + red + ',' + green + ',' + blue + ')';
};

var addProblemCell = function (row, problem, olymp) {
    let score = problem['score'];
    let penalty = problem['penalty'];
    if (olymp) {
        let text;
        if (score === 100) {
            text = '100';
        } else {
            if (score === 0 && penalty === 0) {
                text = '';
            } else {
                text = score;
            }
        }
        let cell = addCell(row, text, 'gray');
        if (text !== '') {
            cell.style.backgroundColor = getScoreColor(score);
        }
    } else if (is_blitz) {
        let bid = problem['bid'];
        let initial_bid = problem['initial_bid'];
        if (problem['verdict'] === 'OK') {
            addCell(row, bid, 'ok');
        } else if (problem['verdict'] === 'BP') {
            cell = addCell(row, bid, 'gray');
            cell.title = 'Ожидает посылки. Ставка: ' + initial_bid;
            cell.style.backgroundColor = '#ffdc33';
        } else if (problem['verdict'] === 'TE') {
            cell = addCell(row, bid, 'bad');
            cell.title = 'Время вышло. Cтавка: ' + initial_bid;
        } else {
            if (penalty === 0) {
                addCell(row, '', 'gray');
            } else {
                cell = addCell(row, bid, 'gray');
                cell.style.backgroundColor = '#f7943c';
                cell.title = '-' + penalty + '. Ставка: ' + initial_bid;
            }
        }
    } else {
        const add_inf = function (text) {
            return '<p class="small">' + text + '&infin;</p>';
        };
        if (problem['verdict'] === 'OK') {
            let text = '+';
            if (penalty > 0) {
                if (penalty <= 9) {
                    text += penalty;
                } else {
                    text = add_inf(text);
                }
            }
            let cell = addCell(row, text, 'ok');
            if (penalty > 9) {
                cell.title = '+' + penalty;
            }
        } else if (problem['verdict'] === 'RJ' || problem['verdict'] === 'IG') {
            let cell = addCell(row, 'D:', 'gray rotating');
            cell.title = 'Отклонено';
            cell.style.backgroundColor = '#f7943c';
        } else if (problem['verdict'] === 'PR') {
            let cell = addCell(row, '?', 'gray');
            cell.title = 'Ожидает подтверждения';
            cell.style.backgroundColor = '#ffdc33';
        } else if (problem['verdict'] === 'AC') {
            let cell = addCell(row, '?', 'gray');
            cell.title = 'Принято к проверке';
            cell.style.backgroundColor = '#fbe995';
        } else if (problem['verdict'] === 'SM') {
            let cell = addCell(row, '<div class="big_image"></div>', 'gray defense');
            cell.title = 'Призван на защиту';
        } else if (problem['verdict'] === 'SV') {
            let cell = addCell(row, '', "gray ban");
            cell.title = "Нарушены правила оформления"
        } else if (problem['verdict'] === 'DQ') {
            let cell = addCell(row, 'ᕁ_ᕁ', 'gray');
            cell.title = 'Дисквалифицированно';
            cell.style.backgroundColor = "#808080";
        } else {
            if (penalty === 0) {
                addCell(row, '', 'gray');
            } else {
                let text = '-';
                if (penalty <= 9) {
                    text += penalty;
                } else {
                    text = add_inf(text);
                }
                let cell = addCell(row, text, 'bad');
                if (penalty > 0) {
                    cell.title = '-' + penalty;
                }
            }
        }
    }
};

var addHeader = function (holder, contests) {
    let header_row1 = holder.insertRow();
    let header_row2 = holder.insertRow();
    addCell(header_row1, 'Place', '', 2, 1);
    addCell(header_row1, 'Surname Name', '', 2, 1);
    addCell(header_row1, 'Mark', '', 2, 1);

    addCell(header_row1, 'Contests', '', 2, 1);
    addCell(header_row1, 'Distants', '', 2, 1);
    addCell(header_row1, 'Σ Solved', '', 2, 1);
    addCell(header_row1, 'Σ Scores', '', 2, 1);

    if (contests.length === 0) {
        addCell(header_row1, '', 'invisible contest_title');
        addCell(header_row2, '', 'invisible');
    }

    contests.forEach(function (contest, idx) {
        let problems = contest['problems'];
        let coefficient = contest['coefficient'];
        let title_text = contest['title'];

        title_text += ' (' + coefficient.toString() + ')';

        let title;
        if (contest_id === -1) {
            title = '<a href="./' + (contests.length - 1 - idx) + '/">' + title_text + '</a>';
        } else {
            title = title_text;
        }
        addCell(header_row1, title, 'gray contest_title', 1, problems.length + 2);
        problems.forEach(function (problem) {
            let cell = addCell(header_row2, problem['short'], 'problem_letter gray');
            cell.title = problem['long'];
        });
        let cell = addCell(header_row2, 'Σ', 'problem_letter gray');
        addCell(header_row2, 'Mark', 'problem_letter gray');
    });
};

var addBody = function (body, users, contests) {
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        let id = user['id'];
        let row = body.insertRow();
        addCell(row, i + 1);
        addCell(row, user['name'], 'name');
        let cell = addCell(row, user['mark'].toFixed(2));
        cell.style.backgroundColor = getMarkColor(user['mark'], 1);

        let cellt_t = addCell(row, user['contests'].toFixed(2));
        let cellt_d = addCell(row, user['distants'].toFixed(2));
        cellt_t.style.backgroundColor = getMarkColor(user['contests']);
        cellt_d.style.backgroundColor = getMarkColor(user['distants']);

        addCell(row, user['solved']);
        addCell(row, user['summary']);

        contests.forEach(function (contest, idx) {
            let problems = contest['users'][id];
            problems.forEach(function (problem) {
                addProblemCell(row, problem, contest['title'][0] === 'D');
            });
            let text = user['scores'][idx];
            if (user['scores'][idx] === 0) {
                text = "";
            }
            let cell = addCell(row, text, 'gray');
            if (contest['title'][0] === 'D' && user['scores'][idx] > 0) {
                cell.style.backgroundColor = getScoreColor(user['scores'][idx] / problems.length);
            }
            else if (contest['title'][0] === 'T' && user['scores'][idx] > 0) {
                cell.style.backgroundColor = getMarkColor(user['scores'][idx] * 10 / problems.length, 10);
            }

            let cell2 = addCell(row, user['marks'][idx][0].toFixed(2));
            cell2.style.backgroundColor = getMarkColor(user['marks'][idx][0], 1);
        });
    }
};

var fixColumnWidths = function (objs) {
    let results_pos = objs[0].childNodes[0].childNodes.length;
    objs[0].childNodes[0].childNodes.forEach(function (column, idx) {
        if (column.classList.contains('gray')) {
            results_pos = Math.min(results_pos, idx);
        }
    });
    let max_width = {};
    objs.forEach(function (obj) {
        obj.childNodes.forEach(function (row, row_idx) {
            let add = 0;
            if (row_idx === 1) {
                add = results_pos
            }
            let first = row_idx === 0;
            row.childNodes.forEach(function (column, idx) {
                if (first && idx >= results_pos) {
                    return;
                }
                let width = column.clientWidth;
                if ((idx + add) in max_width) {
                    max_width[idx + add] = Math.max(max_width[idx + add], width);
                } else {
                    max_width[idx + add] = width;
                }
            });
        })
    });
    objs.forEach(function (obj) {
        obj.childNodes.forEach(function (row, row_idx) {
            let add = 0;
            if (row_idx === 1) {
                add = results_pos
            }
            let first = row_idx === 0;
            row.childNodes.forEach(function (column, idx) {
                if (first && idx >= results_pos) {
                    return;
                }
                if (!column.classList.contains("invisible")) {
                    column.style.minWidth = max_width[idx + add] + 'px';
                }
            });
        });
    });
};

var preprocessData = function (data) {
    return data;
};

var buildStandings = function () {
    if (!_dom_loaded) {
        return;
    }
    if (!_data) {
        return;
    }
    let data = preprocessData(_data);
    let contests = data['contests'];
    if (contest_id !== -1) {
        if (contest_id < 0 || contest_id >= contests.length) {
            alert('Wrong contest id!');
        }
        contests = [contests[contests.length - 1 - contest_id]];
        data['contests'] = contests;
    }

    let users = data['users'];
    calculateInformation(users, contests);
    calculateMark(users, contests);
    users.sort(compareUsers);
    users = users.filter(user => (user['submissions'] > 0) || is_blitz);

    let table = document.getElementById('standings');
    let header = document.createElement('thead');
    let body = document.createElement('tbody');
    table.appendChild(header);
    table.appendChild(body);
    let table_fixed = document.getElementById('standings_fixed');
    let body_fixed = document.createElement('tbody');
    table_fixed.appendChild(body_fixed);
    addHeader(header, contests);
    addHeader(body, contests);
    addBody(body, users, contests);
    addHeader(body_fixed, []);
    addBody(body_fixed, users, []);
    fixColumnWidths([header, body_fixed, body], contests);

    document.getElementsByClassName('wrapper')[0].addEventListener('scroll', function (e) {
        header.style.marginLeft = -e.target.scrollLeft + 'px';
    });

    let rotating_elements = document.getElementsByClassName("rotating");
    for (let i = 0; i < rotating_elements.length; i++) {
        let el = rotating_elements[i];
        let ang = 0;
        setInterval(function () {
            ang += 1;
            ang %= 360;
            el.style.transform = "rotate(-" + ang + "deg)";
        }, 10);
    }
};


//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//


var defaultContestMark = function (total_score, problem_score, olymp) {
    if (problem_score == 0) {
        problem_score = total_score;
    }
    return (problem_score !== 0 ? Math.min(total_score / problem_score, 1) * 12 : 0.0);
};

var newCalculateContestMark = function (
    olymp,
    total_scores,       // двумерный массив пар балла и времени сдачи задач пользователями
    user_id,            // номер пользователя
    contest_info        // информация о контесте
) {
    return useOldContestMark(total_scores, user_id, olymp)
};

var defaultTotalMark = function (marks, coefficients) {
    let mean_mark_t = 0;
    let total_coef_t = 0;
    let mean_mark_d = 0;
    let total_coef_d = 0;
    for (let i = 0; i < marks.length; i++) {
        let coef = 1.0;
        if (contest_id === -1) {
            coef = coefficients[i];
        }
        if (marks[i][1]) {
            mean_mark_d += marks[i][0] * coef;
            total_coef_d += coef;
        } else {
            mean_mark_t += marks[i][0] * coef;
            total_coef_t += coef;
        }
    }
    if (total_coef_t > 0) {
        mean_mark_t /= total_coef_t;
    }
    if (total_coef_d > 0) {
        mean_mark_d /= total_coef_d;
    }
    return [mean_mark_t, mean_mark_d];
};

var useOldContestMark = function (total_scores, user_id, olymp) {
    let total_score = 0;
    let problem_score = new Array(total_scores[user_id].length).fill(0.0);

    let problem_max_score = new Array(total_scores[user_id].length).fill(0.0);
    let problem_accepted = new Array(problem_score.length).fill(0);
    let pr_max = 0;

    if (!olymp) {
        for (let i = 0; i < total_scores.length; i++) {
            for (let j = 0; j < problem_score.length; j++) {
                if (total_scores[i][j]["verdict"] == "OK") {
                    problem_score[j] += total_scores[i][j]['score'];
                }
            }
        }

        for (let j = 0; j < problem_score.length; j++) {
            if (problem_score[j] > 0) {
                problem_max_score[j] += 1.0 / Math.pow(problem_score[j], 1 / 8);
            }
        }

        for (let j = 0; j < problem_score.length; j++) {
            if (total_scores[user_id][j]['score'] > 0) {
                if (problem_max_score[j] == 0) {
                    total_score += total_scores[user_id][j]['score'];
                } else {
                    total_score += problem_max_score[j] * total_scores[user_id][j]['score'];
                }
            }
            pr_max += problem_max_score[j];
        }
    } else {
        for (let i = 0; i < total_scores.length; i++) {
            for (let j = 0; j < problem_score.length; j++) {
                problem_score[j] = Math.max(problem_score[j], total_scores[i][j]['score']);
            }
        }

        for (let j = 0; j < problem_score.length; j++) {
            if (problem_score[j] > 0) {
                pr_max += problem_score[j];
            }
        }

        for (let j = 0; j < total_scores[user_id].length; j++) {
            total_score += total_scores[user_id][j]['score'];
        }
    }

    return calculateContestMark(
        olymp,
        total_score,
        pr_max,
        problem_max_score,
        total_scores.length,
        problem_accepted,
        max_score
    );
};

var compareUsers = function (a, b) {
    if (a['contests'] + a['distants'] !== b['contests'] + b['distants']) {
        return b['contests'] + b['distants'] - a['contests'] - a['distants'];
    }
    if (a['contests'] !== b['contests']) {
        return b['contests'] - a['contests'];
    }
    if (a['distants'] !== b['distants']) {
        return b['distants'] - a['distants'];
    }
    if (a['solved'] !== b['solved']) {
        return b['solved'] - a['solved'];
    }
    if (a['summary'] !== b['summary']) {
        return b['summary'] - a['summary'];
    }
    return a['name'].localeCompare(b['name']);
};

var addHeader = function (holder, contests) {
    let header_row1 = holder.insertRow();
    let header_row2 = holder.insertRow();
    addCell(header_row1, 'Place', '', 2, 1);
    addCell(header_row1, 'Surname Name', '', 2, 1);

    if (enable_marks) {
        addCell(header_row1, 'Total', '', 2, 1);
    }

    addCell(header_row1, 'Contests', '', 2, 1);
    addCell(header_row1, 'Distants', '', 2, 1);
    addCell(header_row1, 'Σ Solved', '', 2, 1);
    addCell(header_row1, 'Σ Scores', '', 2, 1);

    if (contests.length === 0) {
        addCell(header_row1, '', 'invisible contest_title');
        addCell(header_row2, '', 'invisible');
    }

    contests.forEach(function (contest, idx) {
        let problems = contest['problems'];
        let coefficient = contest['coefficient'];
        let title_text = contest['title'];

        title_text += ' (' + coefficient.toString() + ')';

        let title;
        if (contest_id === -1) {
            title = '<a href="./' + (contests.length - 1 - idx) + '/">' + title_text + '</a>';
        } else {
            title = title_text;
        }
        addCell(header_row1, title, 'gray contest_title', 1, problems.length + 2);
        problems.forEach(function (problem) {
            let cell = addCell(header_row2, problem['short'], 'problem_letter gray');
            cell.title = problem['long'];
        });
        let cell = addCell(header_row2, 'Σ', 'problem_letter gray');
        addCell(header_row2, 'Mark', 'problem_letter gray');
    });
};

var addBody = function (body, users, contests) {
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        let id = user['id'];
        let row = body.insertRow();
        addCell(row, i + 1);
        addCell(row, user['name'], 'name');

        if (enable_marks) {
            let cell = addCell(row, user['mark'].toFixed(2));
            cell.style.backgroundColor = getMarkColor(user['mark'], 8);
        }

        let cellt_t = addCell(row, user['contests'].toFixed(2));
        let cellt_d = addCell(row, user['distants'].toFixed(2));
        cellt_t.style.backgroundColor = getMarkColor(user['contests'], 10);
        cellt_d.style.backgroundColor = getMarkColor(user['distants'], 10);

        addCell(row, user['solved']);
        addCell(row, user['summary']);

        contests.forEach(function (contest, idx) {
            let problems = contest['users'][id];
            problems.forEach(function (problem) {
                addProblemCell(row, problem, contest['title'][0] === 'D');
            });
            let text = user['scores'][idx];
            let cell = addCell(row, text, 'gray');
            cell.style.backgroundColor = getMarkColor(user['scores'][idx] * 10 / problems.length, 10);

            let cell2 = addCell(row, user['marks'][idx][0].toFixed(2));
            cell2.style.backgroundColor = getMarkColor(user['marks'][idx][0], 10);
        });
    }
};

var calculateContestMark_ap22 = function (
    olymp,
    total_score,        // суммарный балл за контест
    problem_score,      // массив баллов за задачи
    problem_max_score,  // массив максимальных набранных баллов за задачи
    total_users,        // общее количество участников
    problem_accepted,   // массив количества ОК по задаче
    max_score           // максимальный набранный балл за контест
) {
    if (olymp) {
        return olympContestMark(total_score, problem_score, max_score);
    }
    else {
        return notOlympContestMark(total_score, problem_score);
    }
};

var calculateTotalMark_ap22 = function (
    olymp,
    marks,              // массив оценок за контесты
    coefficients,       // массив коэффициентов контестов
    total_score,        // суммарный балл за все контесты
    contest_score,      // массив баллов за контесты
    contest_max_score,  // массив максимальных набранных баллов за контесты
    problem_score,      // двумерный массив набранных баллов за задачи
    problem_max_score,  // двумерный массив максимальных набранных баллов за задач
    total_users,        // общее количество участников
    problem_accepted    // двумерный массив количества ОК по задаче
) {
    if (olymp) {
        return defaultTotalMark(marks, coefficients);
    }
    else {
        return 10 * Math.sqrt(defaultTotalMark(marks, coefficients));
    }
};

var calculateContestMark = function (
    olymp,
    total_score,        // суммарный балл за контест
    problem_score,      // массив баллов за задачи
    problem_max_score,  // массив максимальных набранных баллов за задачи
    total_users,        // общее количество участников
    problem_accepted,   // массив количества ОК по задаче
    max_score           // максимальный набранный балл за контест
) {
    return defaultContestMark(total_score, problem_score, olymp);
};

var getMarkColor = function (score, coeff) {
    score = Math.min(score, coeff);
    let red = parseInt(240 + (144 - 240) * Math.sqrt(score / coeff));
    let green = parseInt(128 + (238 - 128) * Math.sqrt(score / coeff));
    let blue = parseInt(128 + (144 - 128) * Math.sqrt(score / coeff));
    return 'rgb(' + red + ',' + green + ',' + blue + ')';
};

var calculateInformation = function (users, contests) {
    users.forEach(function (user) {
        let id = user['id'];
        user['solved'] = 0;
        user['summary'] = 0;
        user['submissions'] = 0;
        contests.forEach(function (contest) {
            contest['users'][id].forEach(function (result) {
                if (contest['title'][0] === 'D') {
                    user['summary'] += result['score'];
                } else {
                    user['solved'] += result['score'];
                }
                if (result['score'] !== 0) {
                    user['penalty'] += result['penalty'];
                }
                user['submissions'] += result['penalty'] + result['score'];
            });
        });
    });
};

let contestTimes = new Map([
    [49001, 2411083],
    [49002, 1810218],
    [49003, 1805043],
    [49004, 1199389],
    [49901, 18000],
    [49005, 2397813],
    [49006, 1810606],
    [49902, 18000],
    [49007, 1193392],
    [49008, 1814400],
    [49009, 5000000]
]);

let dist = 0;

var calculateMark = function (users, contests) {
    let coefficients = [];
    let problem_max_score = [];
    let problem_accepted = [];
    let total_scores = {};
    contests.forEach(function (contest, i) {
        total_scores[i] = [];
        problem_max_score.push([]);
        problem_accepted.push([]);
        coefficients.push(contest['coefficient']);
        contest['problems'].forEach(function (problem, j) {
            problem_max_score[i].push(0);
            problem_accepted[i].push(0);
        });
    });

    let user_total_score = {};
    let user_problem_score = {};
    users.forEach(function (user) {
        let id = user['id'];
        user_total_score[id] = 0;
        user_problem_score[id] = [];
        user['marks'] = [];
        user['scores'] = [];
        contests.forEach(function (contest, c_id) {
            let total_score = 0;
            user_problem_score[id].push([]);
            total_scores[c_id].push(contest['users'][id].slice(0));

            total_scores[c_id] = total_scores[c_id].map(function (line) {
                let true_distur_score = 0;
                console.log(line);
                return line.map(function (submit) {
                    if (submit["time"] > contestTimes.get(contest['ejudge_id'])) {
                        if (submit["verdict"] == "OK" && contest['title'][0] === 'T') {
                            submit["verdict"] = "LT";
                            submit['score'] /= 2;
                        }
                    }
                    return submit;
                });
            });

            contest['users'][id].forEach(function (result, p_id) {
                let score = result['score'];
                let is_accepted = false;
                if (score > 0) {
                    is_accepted = true;
                }
                total_score += score;
                problem_max_score[c_id][p_id] = Math.max(problem_max_score[c_id][p_id], score);
                problem_accepted[c_id][p_id] += (+is_accepted);
                user_problem_score[id][c_id].push(score);
            });

            user['scores'].push(total_score);
            user_total_score[id] += total_score;
        });
    });

    users.forEach(function (user, u_id) {
        let id = user['id'];
        user['marks'] = [];
        contests.forEach(function (contest, c_id) {
            user['marks'].push([newCalculateContestMark(
                contest['title'][0] === 'D',
                total_scores[c_id],
                u_id,
                contest["contest_info"]
            ), contest['title'][0] === 'D']);
        });
        let mark = calculateTotalMark(
            user['marks'],
            coefficients,
            user_total_score[id],
            user_problem_score[id],
            problem_max_score,
            users.length,
            problem_accepted
        );
        user['contests'] = Math.min(mark[0], 10);
        user['distants'] = Math.min(mark[1], 10);

        let exist_t = 0;
        let exist_b = 0;
        contests.forEach(function (contest, c_id) {
            if (contest['title'][0] === 'D') {
                exist_b = 1;
            } else {
                exist_t = 1;
            }
        });

        let coeff = 0.5;
        if (exist_b == 0) {
            user['mark'] = user['contests'] * coeff;
        } else if (exist_t == 0) {
            user['mark'] = user['distants'] * coeff;
        } else {
            user['mark'] = Math.min(user['contests'] * coeff + user['distants'] * coeff, 10);
        }
    });
};

var addProblemCell = function (row, problem, olymp) {
    let score = problem['score'];
    let penalty = problem['penalty'];
    if (olymp) {
        let text;
        if (score === 100) {
            text = '100';
        } else {
            if (score === 0 && penalty === 0) {
                text = '';
            } else {
                text = score;
            }
        }
        let cell = addCell(row, text, 'gray');
        if (text !== '') {
            cell.style.backgroundColor = getScoreColor(score);
        }
    } else if (is_blitz) {
        let bid = problem['bid'];
        let initial_bid = problem['initial_bid'];
        if (problem['verdict'] === 'OK') {
            addCell(row, bid, 'ok');
        } else if (problem['verdict'] === 'BP') {
            cell = addCell(row, bid, 'gray');
            cell.title = 'Ожидает посылки. Ставка: ' + initial_bid;
            cell.style.backgroundColor = '#ffdc33';
        } else if (problem['verdict'] === 'TE') {
            cell = addCell(row, bid, 'bad');
            cell.title = 'Время вышло. Cтавка: ' + initial_bid;
        } else {
            if (penalty === 0) {
                addCell(row, '', 'gray');
            } else {
                cell = addCell(row, bid, 'gray');
                cell.style.backgroundColor = '#f7943c';
                cell.title = '-' + penalty + '. Ставка: ' + initial_bid;
            }
        }
    } else {
        const add_inf = function (text) {
            return '<p class="small">' + text + '&infin;</p>';
        };
        if (problem['verdict'] === 'OK') {
            let text = '+';
            if (penalty > 0) {
                if (penalty <= 9) {
                    text += penalty;
                } else {
                    text = add_inf(text);
                }
            }
            let cell = addCell(row, text, 'ok');
            if (penalty > 9) {
                cell.title = '+' + penalty;
            }
        } else if (problem['verdict'] === 'RJ' || problem['verdict'] === 'IG') {
            let cell = addCell(row, 'D:', 'gray rotating');
            cell.title = 'Отклонено';
            cell.style.backgroundColor = '#f7943c';
        } else if (problem['verdict'] === 'PR') {
            let cell = addCell(row, '?', 'gray');
            cell.title = 'Ожидает подтверждения';
            cell.style.backgroundColor = '#ffdc33';
        } else if (problem['verdict'] === 'LT') {
            let cell = addCell(row, '+', 'gray');
            cell.title = 'Принято после дедлайна';
            cell.style.backgroundColor = '#ffdc33';
        } else if (problem['verdict'] === 'AC') {
            let cell = addCell(row, '?', 'gray');
            cell.title = 'Принято к проверке';
            cell.style.backgroundColor = '#fbe995';
        } else if (problem['verdict'] === 'SM') {
            let cell = addCell(row, '<div class="big_image"></div>', 'gray defense');
            cell.title = 'Призван на защиту';
        } else if (problem['verdict'] === 'SV') {
            let cell = addCell(row, '', "gray ban");
            cell.title = "Нарушены правила оформления"
        } else if (problem['verdict'] === 'DQ') {
            let cell = addCell(row, 'ᕁ_ᕁ', 'gray');
            cell.title = 'Дисквалифицированно';
            cell.style.backgroundColor = "#808080";
        } else {
            if (penalty === 0) {
                addCell(row, '', 'gray');
            } else {
                let text = '-';
                if (penalty <= 9) {
                    text += penalty;
                } else {
                    text = add_inf(text);
                }
                let cell = addCell(row, text, 'bad');
                if (penalty > 0) {
                    cell.title = '-' + penalty;
                }
            }
        }
    }
};

var buildStandings = function () {
    if (!_dom_loaded) {
        return;
    }
    if (!_data) {
        return;
    }
    let data = preprocessData(_data);
    let contests = data['contests'];
    if (contest_id !== -1) {
        if (contest_id < 0 || contest_id >= contests.length) {
            alert('Wrong contest id!');
        }
        contests = [contests[contests.length - 1 - contest_id]];
        data['contests'] = contests;
    }

    let users = data['users'];
    calculateInformation(users, contests);
    calculateMark(users, contests);
    users.sort(compareUsers);
    users = users.filter(user => (user['submissions'] > 0) || is_blitz);

    let table = document.getElementById('standings');
    let header = document.createElement('thead');
    let body = document.createElement('tbody');
    table.appendChild(header);
    table.appendChild(body);
    let table_fixed = document.getElementById('standings_fixed');
    let body_fixed = document.createElement('tbody');
    table_fixed.appendChild(body_fixed);
    addHeader(header, contests);
    addHeader(body, contests);
    addBody(body, users, contests);
    addHeader(body_fixed, []);
    addBody(body_fixed, users, []);
    fixColumnWidths([header, body_fixed, body], contests);

    document.getElementsByClassName('wrapper')[0].addEventListener('scroll', function (e) {
        header.style.marginLeft = -e.target.scrollLeft + 'px';
    });

    let rotating_elements = document.getElementsByClassName("rotating");
    for (let i = 0; i < rotating_elements.length; i++) {
        let el = rotating_elements[i];
        let ang = 0;
        setInterval(function () {
            ang += 1;
            ang %= 360;
            el.style.transform = "rotate(-" + ang + "deg)";
        }, 10);
    }
};
