---
title: "typedef 与 using"
description: "用 typedef 或 using 给类型起别名，把 long long、pair 和容器类型的长名字缩短，也便于统一切换类型。"
---
# typedef 与 using

## 简介

类型别名（type alias）就是给一个已有的类型起个短名。C++ 提供两种写法，效果相同：

```cpp
typedef long long ll;
using ll = long long;     // 与上一行等价
```

`typedef` 是从 C 继承下来的关键字，别名写在最后面；`using` 是 C++11 引入的写法，形式是 `using 别名 = 原类型;`，顺序与赋值一致，从左往右即可读通。竞赛代码现在普遍使用 `using`。

别名**不创建新类型**，只是同一个类型的另一个名字。`ll` 和 `long long` 是同一个类型，可以互相赋值、互相传参，类型转换和函数重载的规则也完全一样。`enum class` 定义一个新类型，与类型别名不同。

`typedef` 的语法是：

```cpp
typedef 原类型 别名;
```

除了给 `long long` 起名，也能给指针、数组、函数指针起别名：

```cpp
typedef int* intptr;            // 指针别名
typedef int FiveInts[5];        // 数组别名
typedef int (*Cmp)(int, int);   // 函数指针别名
```

对应的 `using` 写法：

```cpp
using intptr = int*;
using FiveInts = int[5];
using Cmp = int (*)(int, int);
```

数组和函数指针的 `using` 写法可读性较差，因为 `=` 右边要求写出完整类型，而这类类型的声明语法本身不直观。复杂声明见后文。

指针别名有一个源自 C 的易错点：

```cpp
intptr a, b;    // a 和 b 都是 int*

int* c, d;      // 只有 c 是指针，d 是 int
```

一行声明里，`*` 跟着变量名走，所以 `int* c, d;` 里只有 `c` 是指针。定义别名之后，`intptr` 整体表示“指向 `int` 的指针”这个类型，`a`、`b` 都属于该类型。竞赛中稳妥的做法是一行只声明一个变量，或使用别名。

一次起多个别名时，`typedef` 能写在一行，`using` 只能一行一个：

```cpp
typedef int antelope, bagel, mushroom;   // 一行三个别名

using antelope = int;
using bagel = int;
using mushroom = int;
```

`using` 还有一个 `typedef` 做不到的能力：给模板起别名，叫别名模板（alias template）。

```cpp
template <typename T>
using Vec = vector<T>;

Vec<int> a;                  // 就是 vector<int>
Vec<pair<int, int>> b;       // 就是 vector<pair<int, int>>
```

`typedef` 无法定义带参数的别名，需要额外套一层 `struct` 才能实现类似效果。这是 `using` 相对 `typedef` 唯一的能力差异。

`using` 还有另一层用法是引入名字，例如 `using namespace std;`、`using std::cout;`，属于命名空间的话题，见《基本语法》一章，与类型别名无关。

## 主要好处

### 少打字，代码更好读

竞赛代码里几个缩写几乎是通行的：

```cpp
using ll = long long;
using pii = pair<int, int>;
using vi = vector<int>;
```

`ll` 尤其常用。`int` 的范围只有 2^31 左右，题目只要可能超出该范围，就要改用 `long long`，而 `long long` 写起来较长且容易漏字母。`pii` 这个缩写来自“pair of int”，在竞赛代码中使用广泛。

### 简化复杂的类型名

容器嵌套后的类型名较长，使用别名可以缩短：

```cpp
using Graph = vector<vector<int>>;

Graph g(n);                 // n 个点的邻接表
// 等价于 vector<vector<int>> g(n);
```

声明和传参时差别更明显：

```cpp
void dfs(int u, Graph& g) { /* ... */ }
```

竞赛里遍历邻接表通常直接写 `for (int v : g[u])` 这类范围 for（见《流程控制》一章），但把类型收进别名，仍然能让函数签名、结构体成员这些必须写出完整类型的地方变短。

### 给 struct、union、enum 定义的类型起别名

```cpp
struct TreeNode {
    int val;
    TreeNode* left = nullptr;
    TreeNode* right = nullptr;
};

using Tree = TreeNode*;      // 用根节点指针表示一棵树
Tree root = nullptr;
```

C 中实现同样的效果需要更多代码，因为类型名必须带 `struct` 关键字：

```cpp
typedef struct animal {
    char* name;
    int leg_count;
} animal;

animal a;      // 有了别名，才能省掉 struct
```

C++ 不需要这种写法：`struct TreeNode` 可以直接写成 `TreeNode`，因此把 `typedef struct` 与类型定义写在一起在 C++ 中是多余的。这种写法源自 C 的习惯。

### 方便统一切换类型

```cpp
using Val = int;      // 所有用 Val 声明的地方都是 int

Val f1, f2, f3;
```

若发现 `int` 的取值范围不够，只需改一处：

```cpp
using Val = long long;    // f1、f2、f3 全都跟着变成 long long
```

竞赛中为答案的数值类型预留一层别名，可以避免遗漏修改。

### 可移植性

同一段代码在不同机器上，同一个类型的宽度可能不一样：

```cpp
int i = 100000;   // 在 16 位 int 的机器上放不下
```

标准库为此准备了一批宽度明确的类型，它们本身就是用别名定义的：

```cpp
int32_t a;   // 一定占 32 位
int64_t b;   // 一定占 64 位
```

这些名字来自 `<cstdint>`，对应 C 的 `<stdint.h>`。类似的还有 `size_t`（无符号，用来表示大小或下标）和 `ptrdiff_t`（两个指针相减的结果类型），它们都在标准库头文件里用 `typedef` 定义好，换平台时只需改头文件，不必改代码。

竞赛中最常用的是 `int64_t`、`uint64_t`，需要严格 64 位时使用它们，例如做位运算、写哈希的时候。一般情况下 `long long` 即可满足需求：几乎所有竞赛平台的 `long long` 都是 64 位，这是各竞赛平台的共同约定。

### 拆开看不懂的类型声明

C 的类型声明需要从中间向外读，复杂声明不易辨认：

```cpp
char (*(*x(void))[5])(void);
```

逐层定义别名后可以分解为：

```cpp
using Func = char (*)(void);   // 函数指针：无参数，返回 char
using Arr = Func[5];           // 5 个 Func 组成的数组
Arr* x(void);                  // x 是函数，返回指向 Arr 的指针
```

该声明的含义是：`x` 是函数，返回一个指针，指向由 5 个函数指针组成的数组，每个函数指针指向一个无参数、返回 `char` 的函数。竞赛中不会写出这种声明，但阅读库代码时会遇到，别名可用于分解这类声明。

命名方面，别名不是越短越好：`ll`、`pii`、`vi` 是竞赛中通行的缩写；把它们进一步缩成 `a`、`b`，会降低可读性，这种情况下不如不定义别名。
