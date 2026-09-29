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

`typedef` 是从 C 继承下来的关键字，别名写在最后面；`using` 是 C++11 引入的写法，形式是 `using 别名 = 原类型;`，顺序和赋值一致，从左往右读一遍就明白了。竞赛代码里现在基本都用 `using`。

有一点要先说清楚：别名**不创建新类型**，它只是同一个类型的另一个名字。`ll` 和 `long long` 就是同一个类型，可以互相赋值、互相传参，类型转换和函数重载的规则也完全一样。它跟 `enum class` 那种真正定义一个新类型的做法有本质区别。

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

数组和函数指针的 `using` 写法看着有点别扭，因为 `=` 右边要求写出整个类型，而类型语法本身就不直观。复杂的声明下面还会细说。

指针别名这里有个从 C 时代留下来的坑：

```cpp
intptr a, b;    // a 和 b 都是 int*

int* c, d;      // 只有 c 是指针，d 是 int
```

一行声明里，`*` 是跟着变量名走的，所以 `int* c, d;` 里只有 `c` 是指针。起了别名之后，`intptr` 整体就是"指向 `int` 的指针"这个类型，`a`、`b` 都跑不掉。竞赛里的稳妥做法是一行只声明一个变量，或者干脆用别名。

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

`typedef` 写不出这种"带参数的别名"，非得套一层 `struct` 才能勉强绕过去。这是 `using` 相对 `typedef` 唯一的能力差异，也是它更值得用的理由。

顺带区分一下：`using` 还有另一层用法是引入名字，比如 `using namespace std;`、`using std::cout;`，那属于命名空间的话题，见《基本语法》一章，和类型别名是两回事。

## 主要好处

### 少打字，代码更好读

竞赛代码里几个缩写几乎是通行的：

```cpp
using ll = long long;
using pii = pair<int, int>;
using vi = vector<int>;
```

`ll` 尤其常用。`int` 的范围只有 2^31 左右，题目只要可能超，就得换 `long long`，而它写起来又长又容易漏字母。`pii` 这个缩写来自"pair of int"，不用解释大家也认识。

### 简化复杂的类型名

容器嵌套起来名字长得很，别名一上来就清爽了：

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

C 里同一件事要啰嗦一些，因为类型名必须带 `struct` 关键字：

```cpp
typedef struct animal {
    char* name;
    int leg_count;
} animal;

animal a;      // 有了别名，才能省掉 struct
```

C++ 不需要这一手——`struct TreeNode` 直接写 `TreeNode` 就行，所以把 `typedef struct` 和类型定义写在一起在 C++ 里是多余的。看到这种写法时，知道它是从 C 带过来的习惯即可。

### 方便统一切换类型

```cpp
using Val = int;      // 所有用 Val 声明的地方都是 int

Val f1, f2, f3;
```

哪天发现 `int` 会装不下，只改一处：

```cpp
using Val = long long;    // f1、f2、f3 全都跟着变成 long long
```

竞赛里给"答案的数值类型"预留一层别名，是防止自己漏改的好办法。

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

竞赛里最常用的是 `int64_t`、`uint64_t`，需要严格 64 位时用它，比如做位运算、写哈希的时候。平时 `long long` 也够用——几乎所有竞赛平台的 `long long` 都是 64 位，这也算大家默认的约定。

### 拆开看不懂的类型声明

C 的类型声明可以从中间往外读，复杂起来非常难认：

```cpp
char (*(*x(void))[5])(void);
```

一层层起别名之后就顺眼了：

```cpp
using Func = char (*)(void);   // 函数指针：无参数，返回 char
using Arr = Func[5];           // 5 个 Func 组成的数组
Arr* x(void);                  // x 是函数，返回指向 Arr 的指针
```

现在能读出来了：`x` 是函数，返回一个指针，指向"由 5 个函数指针组成的数组"，每个函数指针指向一个无参数、返回 `char` 的函数。竞赛里不会写出这种声明，但读库代码时会遇到，别名是把它们拆开理解的工具。

最后提一句命名。别名不是越短越好：`ll`、`pii`、`vi` 是竞赛圈的通行缩写，用了大家都懂；把它们缩成 `a`、`b` 这种，等于换一种方式写天书，不如不起别名。
