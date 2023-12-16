# LCA

### binary lifting:
* k-th ancestor (наивное и binary lifting)
* k-th ancestor offline O(N+Q) через stack предков текущей вершины + dfs
* lca через binary lifting (через бинпоиск по k + k-th ancestor за log**2 и обычное за log)
* расстояние между вершинами

*Lca offline можно упомянуть, но тк мы снм не проходили, а он там нужен, можно просто сказать вкратце, что вот так тоже умеем.*

### Эйлеров обход
* lca через минимум на отрезке (спарсы, ДО)
* запросы на обратимые функции на пути (например сумма/xor) с изменениями
* запросы в поддереве с изменениями

[Сжатые деревья](https://wiki.algocourses.ru/index.php?title=%D0%A1%D0%B6%D0%B0%D1%82%D1%8B%D0%B5_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D1%8C%D1%8F)