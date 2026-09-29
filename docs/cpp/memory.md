---
title: "内存管理"
description: "程序运行时的内存分为栈（stack）与堆（heap）两块。本章介绍变量的存储期、容器的自动内存管理，以及 malloc / free 的用法。"
---
# 内存管理

## 简介

C++ 程序运行时用到的内存，大致分成几块，竞赛里真正要操心的是其中两块：**栈（stack）**和**堆（heap）**。

**栈**上放函数内部的局部变量。函数被调用时，这些变量随函数进入内存；函数返回时它们自动消失，不需要写任何释放代码。栈的分配和释放只移动栈指针，开销小，代价是容量小——多数平台默认只有几 MB。所以在函数里写 `int a[1000000];`（约 4 MB）可能超出栈容量，程序会以段错误（Segmentation fault）崩溃，俗称“爆栈”。递归层数过深也是同样的原因。竞赛中的做法是把大数组定义成全局变量。

**堆**上放程序主动申请的内存。堆的容量大得多，但申请来的内存不会自动归还，忘记释放就一直占着，直到程序退出，这叫**内存泄漏（memory leak）**。

变量除了有作用域（scope），还有一个属性叫**存储期（storage duration）**，决定它在何时获得内存、何时释放：

| 存储期 | 典型变量 | 存放位置 | 生命周期 |
| --- | --- | --- | --- |
| 自动（automatic） | 函数内的局部变量 | 栈 | 出块即销毁 |
| 静态（static） | 全局变量、`static` 变量 | 静态存储区 | 程序启动到结束 |
| 动态（dynamic） | `new` 出来的对象 | 堆 | 从申请到释放 |

静态存储期有两条竞赛中常用的性质。第一，全局变量和 `static` 变量如果没有显式初始化，会被自动清零；局部变量不会自动清零，它的初值是内存中残留的数据。第二，它们的内存在整个程序运行期间一直有效，函数返回后值仍然保留，记忆化搜索、前缀和这类写法依赖该行为。

所以竞赛代码习惯把大数组直接开在文件最外层：

```cpp
const int N = 1e6 + 5;

int a[N];    // 全局数组：自动清零，也不占用栈空间
int cnt[N];  // 计数数组同样受益于"自动清零"
```

数组长度需要在运行时确定时，竞赛代码优先使用 `vector`，而不是手动在堆上申请内存。这一点是本章和 C 语言的内存讲解最大的不同。

## void 指针

每一块内存都有地址，指针变量用来存地址。但指针必须有类型，否则编译器不知道怎么解读这段二进制——同样的 4 个字节，按 `int` 读是一个数，按 `float` 读是另一个数。

有些场合只关心地址、不关心类型。为此 C 和 C++ 提供了 `void` 指针：它只有地址，没有类型信息。任意类型的指针都能隐式转成 `void*`：

```cpp
int x = 10;

void* p = &x;                    // int* 隐式转成 void*
int* q = static_cast<int*>(p);   // 转回来必须显式转换
```

注意第二行。C 里写 `int* q = p;` 就能编译，C++ 不允许 `void*` 隐式转成别的指针类型，必须加一个 `static_cast`。显式转换用于确认该地址中存放的确实是 `int`。

不能用 `*` 取出 `void` 指针指向的值，因为编译器不知道该按几字节、按什么格式读：

```cpp
char a = 'X';
void* p = &a;

cout << *p << '\n';   // 报错：不能解引用 void 指针
```

`void*` 用于“内存级”的函数：`malloc`、`memcpy`、`memset` 的参数或返回值都是 `void*`，这样一套接口就能处理任意类型的数据。竞赛代码几乎不会主动声明 `void` 指针，但会频繁用到这几个函数。

## new 与 delete

C++ 在堆上申请内存用 `new`，归还用 `delete`：

```cpp
int* p = new int;      // 申请一个 int
*p = 12;
delete p;              // 用完归还

int n = 100;
int* a = new int[n];   // 申请 n 个 int
a[0] = 1;
delete[] a;            // 数组要用 delete[] 释放
```

使用规则如下：

- `new` 配 `delete`，`new[]` 配 `delete[]`。配对错了是未定义行为（undefined behavior）——可能什么事都没有，也可能当场崩溃。
- 释放之后那块地址已经还给系统，不能再读写，更不能 `delete` 第二次。
- `new` 失败时抛 `std::bad_alloc` 异常，不返回空指针，所以不用像检查 `malloc` 那样判空。

`new/delete` 和 `malloc/free` 的本质区别在于是否处理对象：`new` 会调用构造函数，`delete` 会调用析构函数；`malloc/free` 只分配和归还内存，不涉及对象内部状态。对 `int` 这种没有构造函数的类型，两者看不出差别；换成 `string`、`vector` 这类成员，用 `malloc` 分配就是错的。

竞赛代码基本不需要手动使用 `new/delete`，理由有两个。长度往往能预先估出来，使用全局数组或 `vector` 即可；手动管理意味着每一条 `return`、`break`、`continue` 的分支上都要释放，漏掉一次就是泄漏，多释放一次就是未定义行为。下面这个程序演示了三块内存的差别：

```cpp
#include <bits/stdc++.h>
using namespace std;

int g[5];   // 全局数组，自动清零

int main() {
    int local[5];         // 局部数组，值不确定
    int* h = new int[5];  // 堆数组，值也不确定

    cout << g[0] << ' ' << local[0] << ' ' << h[0] << '\n';
    // 只有 g[0] 保证是 0；读另外两个的值属于未定义行为

    delete[] h;
    return 0;
}
```

## 容器与 RAII

竞赛中管理内存主要依靠容器。`vector` 需要多少元素就申请多少，不用的时候自动归还：

```cpp
vector<int> a;      // 空容器
a.push_back(1);     // 追加元素，内部按需扩容
a.resize(n);        // 直接要 n 个元素

{
    vector<int> tmp(1000);   // 进块时在堆上要内存
}                            // 出块时自动释放，一行 delete 都不用写
```

`vector` 把“申请资源”和“释放资源”绑在对象的生命周期上：对象创建时拿到资源，对象销毁时自动还回去。这套做法叫 **RAII**（Resource Acquisition Is Initialization，资源获取即初始化），是 C++ 管理各种资源（内存、文件句柄、锁）的通用思路。`string`、`map`、`queue` 同样如此，使用时不需要关注资源何时归还。

本章剩下的部分讲 `malloc` 家族和 `memcpy` 家族。它们在竞赛中的使用频率低于 `vector` 和 `string`，但在两种场合仍然会遇到：阅读他人的 C 代码，以及需要按字节直接操作内存。以下内容重点说明它们与 `new/delete` 的差别。

## malloc()

`malloc`（memory allocation）来自 `<cstdlib>`，对应 C 的 `<stdlib.h>`：

```cpp
void* malloc(size_t size);
```

参数是要分配的字节数，返回指向这块内存首地址的 `void` 指针；分配失败时返回 `NULL`。它不区分存储的数据类型，只按字节分配，所以只能返回 `void*`。

分配一个 `int`：

```cpp
int* p = (int*)malloc(sizeof(int));
*p = 12;
```

`sizeof(int)` 算出 `int` 占的字节数。前面的 `(int*)` 是强制类型转换，括号里的类型也可以交给编译器去推：

```cpp
int* p = (int*)malloc(sizeof(*p));   // 以后改类型，这句不用动
```

真正常用的场合是分配数组：

```cpp
int* p = (int*)malloc(sizeof(int) * n);   // n 个 int

for (int i = 0; i < n; i++)
    p[i] = i * 5;
```

`malloc` 不会初始化内存，里面还留着上一次写入的二进制数据，要清零得自己调用 `memset`，或者改用下一节的 `calloc`。

下表对照 `malloc/free` 与 `new/delete`：

| | `malloc` / `free` | `new` / `delete` |
| --- | --- | --- |
| 来源 | `<cstdlib>` 里的函数 | 语言内置的运算符 |
| 返回类型 | `void*`，需要自己转型 | 对应类型的指针 |
| 构造 / 析构 | 不调用 | 调用 |
| 分配失败 | 返回 `NULL` | 抛 `std::bad_alloc` |
| 分配数组 | `malloc(n * sizeof(T))` | `new T[n]` |
| 释放数组 | `free(p)` | `delete[] p` |

## free()

`free` 归还 `malloc`、`calloc`、`realloc` 申请来的内存：

```cpp
void free(void* block);
```

参数就是它们返回的那个地址。

```cpp
int* p = (int*)malloc(sizeof(int));
*p = 12;
free(p);    // 还回去
```

释放之后再访问这块地址，或者对它再 `free` 一次，都是未定义行为。

函数内申请内存、返回前忘了释放，是内存泄漏最常见的来源：

```cpp
void gobble(double arr[], int n) {
    double* temp = (double*)malloc(n * sizeof(double));
    // ... 用完没写 free(temp);
}
```

函数一返回，指针 `temp` 就消失了，那块内存却仍被占用，且不再有变量记录它的地址。反复调用该函数，程序占用的内存持续增长。同样的逻辑写成 `vector<double> temp(n);` 就没有这个问题——离开函数时自动释放。

## calloc()

`calloc`（contiguous allocation）也分配内存，和 `malloc` 有两点不同：

```cpp
void* calloc(size_t n, size_t size);
```

一是它接两个参数，分别是元素个数和单个元素的字节数；二是它会把申请到的内存**全部初始化为 0**：

```cpp
int* p = calloc(10, sizeof(int));

// 等同于
int* p = (int*)malloc(sizeof(int) * 10);
memset(p, 0, sizeof(int) * 10);
```

`calloc` 相当于 `malloc` 加一次清零。竞赛中常需要零初始化的内存，拓扑排序的入度数组、计数数组都要求从 0 开始。C++ 中 `vector<int> cnt(n);` 默认把元素初始化成 0，长度还能动态调整。

`calloc` 分配的内存同样用 `free` 释放。

## realloc()

`realloc`（re-allocation）用来调整一块已分配内存的大小：

```cpp
void* realloc(void* block, size_t size);
```

`block` 是先前由 `malloc`、`calloc` 或 `realloc` 得到的内存块，`size` 是新的大小（字节）。返回值是新内存块的地址——它可能和原来相同，也可能搬到了别处，原有数据会自动复制过去，不需要你手动搬。

```cpp
int* b = (int*)malloc(sizeof(int) * 10);

b = realloc(b, sizeof(int) * 2000);   // 从 10 个 int 扩到 2000 个
```

扩容后多出来的部分**不会**初始化。缩小的时候，超出的部分被丢弃。第一个参数传 `NULL` 时，`realloc` 等价于 `malloc`；第二个参数传 `0` 时，它会释放掉这块内存。

竞赛里需要数组动态变长时，`vector` 的 `push_back` 内部做的就是类似的事：容量不够就申请一块更大的内存、把旧元素搬过去、再释放旧的。使用 `a.push_back(x)` 即可，不必自己计算 `realloc` 的大小。

## restrict 说明符

`restrict` 是 C99 引入的指针说明符。它向编译器承诺：这块内存只通过这一个指针访问，不存在第二个指针指向它。

```cpp
int* restrict p = (int*)malloc(sizeof(int));
```

有了这个承诺，编译器可以进行相应优化，比如把循环里反复的内存读取缓存进寄存器。承诺一旦被打破，就是未定义行为：

```cpp
int* restrict p = (int*)malloc(sizeof(int));
int* q = p;
*q = 0;   // 未定义行为：同一块内存有了 p、q 两种访问方式
```

`restrict` 不是 C++ 标准的一部分，GCC 用 `__restrict__` 作为扩展提供它。竞赛代码不会主动使用它，了解 `memcpy` 原型里那两个 `restrict` 的含义即可。

## memcpy()

`memcpy`（memory copy）来自 `<cstring>`，对应 C 的 `<string.h>`，作用是把一段内存按字节复制到另一段：

```cpp
void* memcpy(void* dest, const void* src, size_t n);
```

从 `src` 开始复制 `n` 个字节到 `dest`，返回 `dest`。第三个参数是**字节数**，不是元素个数，通常写成 `sizeof(a)` 或 `k * sizeof(a[0])`。

它在竞赛中常用于整块复制数组，代码比手写 `for` 循环短，速度也更快：

```cpp
int a[100], b[100];

memcpy(b, a, sizeof(a));             // 把 a 的 100 个元素整体复制给 b
memcpy(b + 1, a, 10 * sizeof(int));  // 把 a 的前 10 个元素复制到 b[1..10]
```

两个内存块**不能重叠**，`memcpy` 不处理这种情况（有重叠要用下一节的 `memmove`）。复制字符串也常用它：`strcpy` 要逐个检查结尾的 `\0`，`memcpy` 只按字节复制，通常更快。在 C++ 里，字符串复制使用 `string` 的赋值或拷贝构造。

## memmove()

`memmove`（memory move）做的事和 `memcpy` 一样，区别是它**允许两块内存重叠**。没有重叠时，两者的行为完全相同。

```cpp
void* memmove(void* dest, const void* src, size_t n);
```

重合的意义在于“原地挪动数组”：

```cpp
int a[100];
// ...

// 把从 a[1] 开始的 99 个元素整体前移一位，
// 效果相当于删掉了 a[0]
memmove(a, a + 1, 99 * sizeof(int));
```

源区间 `a[1..99]` 和目标区间 `a[0..98]` 是重叠的，用 `memcpy` 会边读边写、把还没读到的数据覆盖掉，`memmove` 则保证结果正确（实现上会判断方向，必要时从后往前复制）。

竞赛里删除数组中间一个元素、把后面的元素整体前移，就是这种操作。使用 `vector` 时，一句 `a.erase(a.begin() + i)` 即可完成。

## memcmp()

`memcmp`（memory compare）按字节比较两块内存：

```cpp
int memcmp(const void* s1, const void* s2, size_t n);
```

它把两个内存区域的字节当作字符，按字典序逐个比较，返回一个整数：完全相同返回 `0`，`s1` 大返回正数，`s1` 小返回负数。

```cpp
char* s1 = "abc";
char* s2 = "acd";

int r = memcmp(s1, s2, 3);   // 'b' < 'c'，返回负数
```

比较的是二进制字节，不受 `\0` 影响，所以能用来判断两段内存是否完全一致，竞赛里偶尔这么用：

```cpp
if (memcmp(a, b, sizeof(a)) == 0) {
    // a 和 b 的每一个字节都相同
}
```

它比 `for` 循环快，但有两处限制。第一，不能拿它比较 `double` 数组：浮点数的二进制表示和数值大小不是一回事，`0.0` 和 `-0.0` 的字节就不相同。第二，不能拿它比较结构体：成员之间可能有内容未定义的填充字节，两个数值上相等的结构体，`memcmp` 的结果未必是 0（填充的原理见《结构体》一章）。这两处应使用逐成员比较，而不是按字节比较。
