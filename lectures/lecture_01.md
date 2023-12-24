# Лекция 1
## Рассказ про префиксные суммы
(ориентируемся на [алгоритмику](https://ru.algorithmica.org/cs/range-queries/prefix-sum/))

Рассказ про префиксные суммы на примере базовой задачи “дан массив, надо уметь считать сумму на отрезке”, показать, что втупую решается за квадрат, но можно решать за линию, показав префсуммы

Показать код (точнее, показать, как можно считать префсуммы (полуинтервалы/отрезки, в 0-индексации/1-индексации))

Префиксные суммы не обязательно можно делать на сумму (xor, умножение по модулю, сумма по модулю)

Иногда бывает переполнение, нужно его избегать.

Разностный массив (```b[i] = a[i] - a[i - 1]```) и задачи, связанные с ним (пример: добавление арифметической прогрессии на отрезке)

Многомерные префиксные суммы.

Примеры задач, которые можно разобрать:
- задачи с алгоритмики (подотрезок с заданной суммой за линейное время, подотрезок с равной суммой в первом и втором массиве (на данных индексах), найти подмножество из множества чисел размера n, сумма которого делится на n)
- число нулей на отрезке
- число подотрезков, состоящих из нулей
- 9 задача с [листка](https://github.com/TheIvanYes/tink-lectures/blob/main/lectures/photo_2023-09-29%2017.21.04.jpeg)
## Рассказ про два указателя

(ориентируемся на [алгоритмику](https://algorithmica.org/tg/mergesort))


Рассказ про два указателя на примере задачи “дан отсортированный массив, найти количество пар чисел с разницей > K или слияние массива" (любая типовая задача подойдет)

Показать код (точнее, показать, как можно красиво решать задачи двумя указателями)

Примеры задач, которые можно разобрать:
- сортировка слиянием
- задача с > 2 указателей (пример: задача "три массива" с алгоритмики)
- максимальная разница, но не больше K (с алгоритмики)
- дана строка, нужно склеить подряд идущие пробелы в один (inplace)