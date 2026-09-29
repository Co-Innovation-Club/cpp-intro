---
title: "变量说明符"
description: "说明符（specifier）写在变量声明里，为编译器提供变量行为、存储方式或优化前提的额外信息。竞赛中最常用的是 const 和 static，其余说明符较少使用。"
---
# 变量说明符

变量声明可以在类型前后添加关键字，为编译器提供变量是否可修改、存储位置以及可用优化等信息。这类关键字称为**说明符（specifier）**。多数说明符向编译器提供附加信息，不影响程序语义；少数说明符会改变变量行为，使用错误会导致编译错误。

按照竞赛代码中的使用频率，`const` 和 `static` 较为常见，`auto` 用于类型推导，`extern` 用于多文件工程，`register`、`volatile` 和 `restrict` 主要用于底层开发。

## const

`const` 表示变量只读，不能修改。对其赋值会导致编译错误：

```cpp
const double PI = 3.14159;
PI = 3;   // 报错：PI 是只读的
```

`const` 数组的成员也不能修改：

```cpp
const int arr[] = {1, 2, 3, 4};
arr[0] = 5;   // 报错
```

### 竞赛里用它定义常量

题目里的数组上限、模数、无穷大，惯例用 `const` 写：

```cpp
const int MAXN = 100005;
const int MOD = 1000000007;
const long long INF = 0x3f3f3f3f3f3f3f3fLL;
```

`#define` 只进行文本替换。`#define MAXN 100005` 没有类型和作用域，调试器中也没有对应的符号，编译器无法对它进行类型检查。`const int MAXN = 100005;` 是 `int` 类型的常量，会参与类型检查，并在调试信息中保留名称；相关错误也会指向对应的位置。

需要在**编译期**完成计算的场合，例如数组长度、`case` 标签和模板参数，使用 `constexpr` 可以明确表达这一要求：

```cpp
constexpr int MAXN = 100005;
int a[MAXN];   // 合法：MAXN 是编译期常量
```

`constexpr` 由 C++11 引入，表示“该值在编译期确定”。普通 `const` 变量由常量表达式初始化时也能满足编译期要求，但 `constexpr` 的语义更明确。一般常量可以使用 `const`；需要强制编译期求值时，应使用 `constexpr`。`#define` 适用于条件编译开关等预处理用途（见《预处理器》一章）。

### 指针与 const

`const` 修饰指针时，其位置决定含义：

```cpp
const int* x;   // 同 int const* x：*x 不能改，x 本身可以改
int* const x;   // x 保存的地址不能改，*x 可以改
```

`const` 位于 `*` 左侧时，修饰指针指向的内容：

```cpp
int p = 1;
const int* x = &p;
(*x)++;   // 报错：不能通过 x 修改 p
x++;      // 合法：x 自己换了个地址
```

`const` 位于 `*` 右侧时，修饰指针本身：

```cpp
int p = 1;
int* const x = &p;
x++;      // 报错：x 的地址不可改
(*x)++;   // 合法：p 变成 2
```

两种写法可以组合使用。`const char* const x` 表示 `x` 保存的地址和它指向的字符串都不能修改。

一种读取方法是从变量名开始，先向右读，再向左读。`const int* x` 可以读作“`x` 是指针，指向 `const int`”；`int* const x` 可以读作“`x` 是常量，类型是 `int*`”。

### 函数参数里的 const

参数使用 `const` 时，调用者可以明确知道该参数不会在函数中被修改，编译器也会阻止对该参数的修改：

```cpp
void find(const int* arr, int n);
```

C++ 传递较大的对象（`vector`、`string`）时，通常使用 **const 引用**，以避免复制并保证只读：

```cpp
void printAll(const vector<int>& v);
```

这一声明中的 `&` 表示不复制对象，`const` 表示不修改对象。竞赛代码通常将函数参数写成 `const vector<int>&`；写成 `vector<int>` 会额外复制一份数据，数据量较大时可能导致超时。

指针指向 `const` 变量时，通过该指针修改值同样不合法，即使指针本身没有使用 `const`。

```cpp
const int i = 1;
int* j = &i;   // 报错：不能把 const int* 赋给 int*
```

编译器会在这一行报告错误：丢弃 const 限定的赋值不符合类型规则，无法通过编译。

## static

`static` 有三种含义不同的用法。

**（1）函数内部的局部变量。** 函数返回后，变量的值仍然保留，可在下次调用时继续使用；初始化只执行一次。

```cpp
void f() {
    static int cnt = 0;   // 只在第一次进入 f 时执行这次初始化
    cnt++;
    cout << cnt << '\n';
}
```

连续调用三次 `f()` 时，输出依次为 `1`、`2`、`3`。该变量的生命周期持续到整个程序结束，但作用域仅限于 `f` 内部。

多组测试数据共用同一个函数时，`static` 变量不会在每组数据开始时归零，需要手动重置，否则其值会持续累加。除记忆化等需要保留状态的场景外，竞赛代码很少在函数中使用 `static`。

**（2）全局变量。** 在文件最外层添加 `static`，表示该变量仅供当前文件使用，其他源文件无法引用。此时 `static` 改变变量的**链接属性（linkage）**，即链接器能否在其他文件中找到该名称。

C++ 不要求静态存储期变量使用常量表达式初始化，全局变量和静态变量可以使用运行时计算的值初始化：

```cpp
int n = 10;
static int m = n;   // C++ 合法；同样写法在 C 里是错误
```

C++ 允许这种写法，但初始化会在 `main()` 执行前进行，称为动态初始化。多个此类全局变量的初始化顺序不确定，程序不能依赖它们之间的顺序。函数内部 `static` 变量的动态初始化发生在第一次执行到声明处时；C++11 起，该过程是线程安全的。

**（3）函数。** 只在当前文件中使用的函数可以声明为 `static`，其他文件可以定义同名函数而不会发生冲突：

```cpp
static int g(int i);
```

单文件竞赛代码无法体现“文件私有”的作用，因为程序只有一个文件。该用法主要用于多文件工程，见《多文件项目》一章。

### 竞赛里“全局数组自动清零”

全局变量和 `static` 变量位于静态存储区，未显式初始化时会自动进行零初始化。未初始化的局部变量位于栈上，其值不确定。

因此，竞赛代码经常将数组声明在文件最外层：

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
int a[MAXN];              // 全局数组：自动全是 0，不用手写循环清零
long long sum[MAXN];

int main() {
    cout << a[0] << ' ' << sum[MAXN - 1] << '\n';   // 0 0
    return 0;
}
```

处理多组数据时，全局数组不会在每组数据开始时自动归零，需要使用循环或 `memset` 手动重置：

```cpp
memset(a, 0, sizeof(a));      // 全部置 0
memset(a, 0x3f, sizeof(a));   // 全部置 0x3f3f3f3f，常用来当"无穷大"
memset(a, -1, sizeof(a));     // 全部置 -1（每个字节都是 0xff）
```

`memset` 来自 `<cstring>`，按**字节**填充，因此只适合设置为“每个字节都相同”的值。`0x3f3f3f3f` 的每个字节都是 `0x3f`，可以使用 `memset` 设置；值 `1` 无法通过这种方式设置，因为每个字节写入 `0x01` 后，读取结果是 `16843009`。`memset(a, 1, sizeof(a))` 是竞赛代码中的常见错误。

## auto

C++11 起，`auto` 用于**类型推导（type deduction）**：由编译器根据初始值推断变量类型。

```cpp
auto x = 1;      // x 是 int
auto y = 1.5;    // y 是 double
```

`auto` 必须在声明时提供初始值，否则编译器无法推导类型并会报告错误。推导结果与初始值的类型一致，不会进行隐式提升，但显式转换和引用会影响结果。

竞赛代码中的 `auto` 主要用于两类场景。第一类是名称较长的类型，尤其是迭代器：

```cpp
map<string, int> mp;
for (auto it = mp.begin(); it != mp.end(); it++)
    cout << it->first << ' ' << it->second << '\n';
```

二是范围 for。

```cpp
vector<int> v = {3, 1, 4, 1, 5};

for (auto x : v)          // x 是 int，拿到的是副本
    cout << x << ' ';

for (auto& x : v)         // 引用：能改到 v 的元素，也省掉一次拷贝
    x *= 2;

for (const auto& x : v)   // 只读且不拷贝，遍历大对象的标准写法
    cout << x << ' ';
```

三种写法的差别是：`auto x` 会复制元素，`auto& x` 是引用，`const auto& x` 是只读引用。遍历 `vector<pair<int,int>>` 等包含较大元素的容器时，使用 `auto` 会增加一次复制，使用 `auto&` 可以避免该复制。

C++17 还支持**结构化绑定（structured binding）**，可以同时获取 `pair` 或结构体的多个成员：

```cpp
pair<int, int> p = {1, 2};
auto [x, y] = p;   // x = 1，y = 2
```

## extern

`extern` 表示变量或函数在其他文件中定义，当前文件只对其进行**声明**，不分配存储空间。`extern` 向编译器提供名称，实体所需的内存由其他文件提供。

```cpp
extern int a;   // 声明：a 在哪定义不关我的事，我只要能用它
```

需要区分**声明（declaration）**和**定义（definition）**。`int a;` 是定义，会分配内存；`extern int a;` 是声明，只使编译器获知该名称。一个变量可以声明多次，但只能定义一次。这一规则称为单一定义原则（one definition rule, ODR），多文件项目中的链接错误大多与其有关。

如果声明中包含初始化，`extern` 会失效，因为初始化会在当前文件中产生实体：

```cpp
extern int i = 0;   // 等同于 int i = 0;，extern 没起作用
```

函数默认具有 `extern` 属性，可以被其他文件调用，因此函数声明通常不写该关键字：

```cpp
extern int f(int i);
// 等同于
int f(int i);
```

单文件竞赛代码不需要使用 `extern`。多文件工程使用它共享全局变量，具体写法见《多文件项目》一章。

## register

`register` 用于向编译器建议将高频使用的变量存入 CPU 寄存器。CPU 寄存器的读写速度高于内存，但数量有限。编译器可以忽略该建议。

```cpp
register int a;
```

寄存器不属于内存，也没有地址，因此 `register` 修饰的变量不能取地址：

```cpp
register int a;
int* p = &a;   // 报错：a 可能不在内存里
```

这项限制现已不再适用。现代编译器会自行分配寄存器，其判断通常比人工提示更准确。`register` 说明符在 C++11 中被弃用，并在 **C++17 中删除**。使用 `-std=c++17` 编译 `register int a;` 时，GCC 会报告 `ISO C++17 does not allow 'register' storage class specifier`。该词仍作为关键字保留，不能用 `register` 作为变量名。

竞赛代码可以通过编译器优化选项提高运行速度：

```bash
g++ -std=c++17 -O2 -o a a.cpp
```

`-O2` 启用常用优化，寄存器分配由编译器决定。

## volatile

`volatile` 表示变量的值可能在程序控制之外发生变化。每次使用该变量时，编译器都必须重新从内存读取，不能缓存值，也不能将多次读写合并为一次。

```cpp
volatile int foo;
volatile int* bar;
```

它主要用于硬件寄存器和信号处理等场景。硬件寄存器的值会随设备状态变化，同一地址的两次读取可能得到不同结果。如果编译器复用第一次读取的缓存值，程序会产生错误。信号处理函数中被异步修改的变量也属于这一类。

```cpp
int foo = x;
// ... 中间没有任何语句修改 x
int bar = x;
```

没有 `volatile` 时，如果两次读取 `x` 之间没有语句修改其值，编译器可能只读取一次，并将该值同时用于 `foo` 和 `bar`。添加 `volatile` 后，编译器会执行两次读取。

`volatile` **不保证原子性，也不保证线程安全**。它只限制编译器对读写操作进行优化，不能解决多核 CPU 的乱序执行和缓存一致性问题。多线程程序需要使用 `<atomic>` 中的原子类型或互斥量。竞赛程序通常为单线程，因此一般不使用 `volatile`。

## restrict

`restrict` **不属于 C++ 标准**（它由 C99 引入，C++ 标准未采纳）。GCC 在 C++ 中以 `__restrict__`（或 `__restrict`）的形式提供该扩展。

它用于向编译器保证相关内存只通过一条路径访问，使编译器能够采用更多优化。

```cpp
int* restrict pt = (int*)malloc(10 * sizeof(int));
```

上面的声明表示 `pt` 是访问该内存的唯一途径。如果同一块内存可以从两个位置读写，则不能添加 `restrict`：

```cpp
int foo[10];
int* bar = foo;   // foo 和 bar 指向同一块内存，foo 不能声明成 restrict
```

`restrict` 用于函数参数时，表示两个参数指向的内存区域不重叠：

```cpp
void swap(int* restrict a, int* restrict b) {
    int t = *a;
    *a = *b;
    *b = t;
}
```

编译器知道 `a`、`b` 互不干扰，就不必为“写 `*a` 会不会影响到 `*b`”插入额外的检查。要留意的是，如果传进来的两个指针实际重叠，程序行为是**未定义的**——`restrict` 是你向编译器做出的承诺，承诺错了后果自负。

竞赛里没有手写 `restrict` 的场合，把它当成理解编译器优化的背景知识就够了。
