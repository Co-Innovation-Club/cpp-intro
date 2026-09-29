---
title: "枚举"
description: "枚举（enum）把一组有名字的整数常量打包成一个类型，底层仍是整数；C++11 的 enum class 补上了强类型和作用域。竞赛里常用它表示方向或状态，并配合数组下标使用。"
---
# 枚举

如果一种类型的取值只有少数几种可能，每种取值还有明确的含义，把它们的名字定义出来，代码会比裸写数字好读得多。C 语言为此提供了 `enum`，中文叫**枚举（enumeration）**，C++ 完整继承下来，并在 C++11 里做了增强。

```cpp
enum colors { RED, GREEN, BLUE };
```

这里 `colors` 是一个新类型，只有三种取值：`RED`、`GREEN`、`BLUE`。这三个名字是**枚举常量（enumerator）**，编译器默认把它们依次赋成整数 `0`、`1`、`2`。

```cpp
cout << RED << ' ' << GREEN << ' ' << BLUE << '\n';     // 0 1 2
```

`RED` 比 `0` 好在哪儿？好在读代码的人不用去查"0 到底是什么颜色"。枚举的全部价值就在这一点：给整数取一个有含义的名字。底层还是整数，编译器不会为此付出任何额外开销。

枚举常量的名字遵守标识符命名规范，习惯上全大写。

## 枚举变量

定义了类型，就可以用它声明变量：

```cpp
colors c;           // c 的取值只会是 RED / GREEN / BLUE 之一

c = BLUE;
cout << c << '\n';  // 2
```

最后一行能直接打印出 `2`，因为**普通 `enum` 会隐式转换成整数**。这既方便，也是隐患，讲 `enum class` 时会对比。

## 起别名与匿名枚举

C 里要用 `typedef` 给枚举起别名：

```cpp
typedef enum { SHEEP, WHEAT, WOOD, BRICK, ORE } RESOURCE;
RESOURCE r;
```

同样，C++ 里这层 `typedef` 可以省掉，直接给枚举起名字：

```cpp
enum Resource { SHEEP, WHEAT, WOOD, BRICK, ORE };
Resource r;
```

也可以顺手在声明类型的同时定义变量：

```cpp
enum { SHEEP, WHEAT, WOOD, BRICK, ORE } r = BRICK, s = WOOD;
```

`r` 的值是 `3`，`s` 的值是 `2`。

有时候定义枚举的目的不是造一个类型，只是想凑一组常量，这时可以省掉类型名：

```cpp
enum { ONE, TWO };
cout << ONE << ' ' << TWO << '\n';      // 0 1
```

这种没有类型名的枚举叫**匿名枚举**，声明的名字直接当整数常量用。常量之间用逗号分隔，最后一个后面的尾逗号可写可不写：

```cpp
enum { ONE, TWO, };
```

## 自己指定值

枚举会自动编号，规则是：不写值就从 `0` 开始递增，写了值就用写的（值必须是整数常量表达式）。

```cpp
enum { ONE = 1, TWO = 2 };
cout << ONE << ' ' << TWO << '\n';      // 1 2
```

值可以跳着来，可以是负数，也可以两个常量取同一个值：

```cpp
enum { X = 2, Y = 18, Z = -2 };     // 不连续
enum { P = 2, Q = 2, R = 2 };       // 允许重复
```

两者混着写时，没写值的常量从上一个"写了值的常量"往后递加：

```cpp
enum {
    A,          // 0
    B,          // 1
    C = 4,      // 4
    D,          // 5
    E,          // 6
    F = 3,      // 3
    G,          // 4
    H           // 5
};
```

由于枚举常量本质上就是整型常量，凡是整数能出现的地方它都能用：数组长度、`switch` 的 `case` 标签、模板参数等等。这条性质在竞赛里非常实用，下面马上就用得到。

## enum class

普通 `enum` 有三个不好用的地方：

- 枚举常量泄漏到外层作用域，同一个作用域里不能出现两个重名常量（两个枚举都想叫 `LEFT`，就冲突了）；
- 能隐式转成 `int`，也能从 `int` 隐式转回来，写错了编译器不吭声；
- 底层类型不明确，大小由实现决定（通常是 `int`）。

C++11 引入的 **`enum class`（强类型枚举）** 把这三条都补上了：

```cpp
enum class Color { Red, Green, Blue };
enum class Status { OK, Error };

Color c = Color::Red;       // 必须带枚举名限定
// int x = c;               // 报错：不能隐式转成 int
int x = (int)c;             // 想转必须显式强转
// Color e = 0;             // 报错：int 不能隐式转成枚举
```

关键差别有两条。**一是作用域**：`Color::Red` 和 `Status::OK` 各归各的，同名常量不会再撞车。**二是强类型**：`enum class` 不和整数互相隐式转换，写错的地方编译器会当场拦下来。

底层类型还能显式指定，顺便做内存优化：

```cpp
enum class Dir : unsigned char { Up, Right, Down, Left };   // 只占 1 字节
```

不指定时，`enum class` 的底层类型默认是 `int`。

那该用哪个？竞赛里两种写法都很常见。`enum class` 更安全，适合"状态标记"这类场合；普通 `enum` 因为能直接当整数用，需要拿它做数组下标时更顺手，下一节就是这种用法。

## 竞赛里的用法

**表示方向。** 走迷宫、在网格上搜索时，四个方向写成枚举，代码立刻清楚：

```cpp
#include <bits/stdc++.h>
using namespace std;

enum Dir { UP, RIGHT, DOWN, LEFT };     // 0 1 2 3

// 方向与坐标增量对齐，下标就是方向
const int dx[4] = {0, 1, 0, -1};
const int dy[4] = {-1, 0, 1, 0};

int main() {
    int x = 3, y = 5;                   // 当前格子

    int nx = x + dx[UP];
    int ny = y + dy[UP];                // 向上走一格

    cout << nx << ' ' << ny << '\n';    // 3 4
    return 0;
}
```

`UP`、`RIGHT`、`DOWN`、`LEFT` 恰好是 `0` 到 `3`，与 `dx`、`dy` 的下标一一对应，`dx[UP]` 比 `dx[0]` 自解释得多。要枚举所有方向时，直接遍历就够了：

```cpp
for (int d = 0; d < 4; d++) {
    int nx = x + dx[d], ny = y + dy[d];
    // ...
}
```

反方向也有个常用技巧：`(d + 2) % 4` 就是 `d` 的对面方向，这也是把方向编成 `0..3` 的好处。

如果换成 `enum class Dir { Up, Right, Down, Left };`，`dx[Dir::Up]` 就得写成 `dx[(int)Dir::Up]` 或 `dx[static_cast<int>(Dir::Up)]`，每个下标都要强转一次，反而累赘——这就是"要当数组下标用"时更偏向普通 `enum` 的原因。

**表示状态。** 比如用 BFS 记录格子的访问情况：

```cpp
enum State { UNVISITED, VISITING, VISITED };    // 0 1 2

State st[1005][1005];       // 全局数组自动清零，即全部 UNVISITED
```

`st[i][j] == VISITING` 比 `st[i][j] == 1` 清楚，也不容易和别的标志位混淆。

枚举也常和 `switch` 搭配：

```cpp
switch (d) {
    case UP:    /* ... */ break;
    case RIGHT: /* ... */ break;
    case DOWN:  /* ... */ break;
    case LEFT:  /* ... */ break;
}
```

`switch` 的 `case` 标签必须是整型常量，枚举常量正好满足。

## 作用域

枚举的作用域规则和变量相同：在文件最外层声明，整个文件都可见；在代码块里声明，就只在这个块里有效。把枚举放进函数内部，能避免和其他地方的名字冲突。

说到底，枚举和一串 `const int` 在功能上有重叠，区别在于**意图**：`enum` 明确告诉读代码的人"这些值属于同一组，且只会是这几个"，编译器也能顺带挡住一部分非法赋值。
