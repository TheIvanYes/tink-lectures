# Sparse tables
(опираюсь на [алгоритмику](https://algorithmica.org/ru/sparse-table))
Мы обсуждали префиксные суммы - но префиксные суммы не умеют считать, к примеру минимум на отрезке (при неизменном массиве). Вводим новую структуру данных - sparse table, которая будет строиться за $O(n \log n)$ и выполнять взятие минимума/максимума за $O(1)$ (тоже при неизменном отрезке).

Что такое sparse table - таблица $st$, размером $\log(n) \times n$, в $st_{i,j}$ лежит минимум на отрезке $[j, j + 2^i - 1]$
Как мы ее будем строить:
```cpp
int a[maxn], mn[logn][maxn];
// инициализация вектора, logn - максимально возможный логарифм от длины отрезка.
for (int i = 0; i < n; i++) {
  mn[0][i] = a[i];
} // или же
memcpy(mn[0], a, sizeof a);

for (int l = 0; l < logn - 1; l++)
    for (int i = 0; i + (2 << l) <= n; i++)
        mn[l+1][i] = min(mn[l][i], mn[l][i + (1 << l)]);
```

Теперь как брать минимум:
```cpp
int rmq(int l, int r) { // полуинтервал [l; r)
    int t = __lg(r - l);
    return min(mn[t][l], mn[t][r - (1 << t)]);
}

```

Можно брать любую операцию, которая ассоцитативна, коммутативна и идемпотентна (то есть min, max, gcd подойдут).

Можно построить двумерные спарсы (по аналогии с двумерными префиксными суммами), тогда надо будет брать минимум на подпрямоугольниках (таблица будет вида mn[l][i][j]).

# Сверху
(опираемся на алгоритмику)
Теперь мы приходим к задаче "взять минимум/максимум/сумму/любую операцию на отрезке, изменить в точке" или "взять значение в точке, сделать += на отрезке".

```cpp
void build(int v, int tl, int tr) {
    if (tl == tr) t[v] = a[tl];
    else {
        int tm = tl + tr >> 1;
        build(v << 1, tl, tm);
        build(v << 1, tl, tm);
        t[v] = min(t[v << 1], t[v << 1 | 1]);
    }
}

void upd(int v, int tl, int tr, int pos, int val) {
    if (tl == tr) t[v] = val;
    else {
        int tm = tl + tr >> 1;
        if (pos <= tm) upd(v << 1, tl, tm, pos, val);
        else upd(v << 1 | 1, tm + 1, tr, pos, val);
        t[v] = min(t[v << 1], t[v << 1 | 1]);
    }
}

int get(int v, int tl, int tr, int l, int r) {
    if (tr < l || r < tl) return 1e18;
    if (l <= tl && tr <= r) return t[v];
    int tm = tl + tr >> 1;
    return min(get(v << 1, tl, tm, l, r), get(v << 1 | 1, tm + 1, tr, l, r));
}
```
Рассказать про то, что можно не только минимум брать, что можно брать любую функцию, композиция которой легко считается.

Также нас может заинтересовать другая постановка задачи - сделать += на отрезке, взять значение в точке. Тогда взглянем на задачу немного по-другому:

```cpp
void build(int v, int tl, int tr) {
    if (tl == tr) t[v] = a[tl];
    else {
        int tm = tl + tr >> 1;
        build(v << 1, tl, tm);
        build(v << 1, tl, tm);
        t[v] = t[v << 1] + t[v << 1 | 1];
    }
}

void upd(int v, int tl, int tr, int l, int r, int val) {
    if (tr < l || r < tl) return;
    if (l <= tl && tr <= r) t[v] += val;
    int tm = tl + tr >> 1;
    upd(v << 1, tl, tm, l, r, val);
    upd(v << 1 | 1, tm + 1, tr, l, r, val);
}

int get(int v, int tl, int tr, int pos) {
    if (tl == tr) return t[v];
    int tm = tl + tr >> 1;
    if (pos <= tm) return t[v] + get(v << 1, tl, tm, pos);
    else return t[v] + get(v << 1 | 1, tm + 1, tr, pos);
}
```
# Cнизу
Дерево отрезков снизу банально быстрее из-за отсутствия рекурсии и меньшего объема памяти. Но дерево отрезков снизу не умеет многое, что умеет ДО сверху, хотя оно достаточно простое в понимании (ориентируюсь на [эту](https://codeforces.com/blog/entry/18051) статью)
```cpp
```


# Спуск по дереву

Пример задачи, для которой требуются спуски - поиск k-го нуля справа от l.

примерный код спусков:
```cpp
const int N = 2e5;
int t[N];

std::pair<int, int> find_k_th_zero(int v, int tl, int tr, int l, int k) {
    if (tr < l) {
        return {-1, 0};
    }
    if (t[v] < k && tl >= l) {
        return {-1, t[v]}; 
    }
    if (tl == tr && k == 1) {
        return {tl, 1};
    }
    int tm = (tl + tr) / 2;
    std::pair<int, int> res = {-1, -1};
    auto res = find_k_th_zero(2 * v, tl, tm, l, k);
    auto res2 = res;
    if (res.first == -1) {
        res2 = find_k_th_zero(2 * v + 1, tm + 1, tr, l, k - res.second);
        res2.second += res2.first;
    }
    return res2;
}
```


