---
title: "函数"
description: "函数（function）是一段可以重复调用的代码，接受参数、返回结果。C++ 在 C 的基础上补上了引用传参、默认参数、重载和 inline。"
---
# 函数

## 简介

函数是一段可以重复执行的代码，接受不同的参数，完成对应的操作。下面就是一个函数。

```cpp
int plus_one(int n) {
    return n + 1;
}
```

上面声明了函数 `plus_one()`。函数声明的语法有几点要注意。

（1）返回值类型。函数声明时先给出返回值的类型，上例是 `int`，表示 `plus_one()` 返回一个整数。

（2）参数。函数名后面的圆括号里要写明参数的类型和名字，`plus_one(int n)` 表示有一个整数参数 `n`。

（3）函数体。函数体写在花括号里，花括号后面不用加分号。左花括号可以跟函数名同一行，也可以另起一行，本书用同一行。

（4）`return` 语句。`return` 给出返回值，程序执行到这里就跳出函数、结束本次调用。函数没有返回值时可以省略 `return`，或者写成 `return;`。

调用函数，只要在函数名后面加圆括号，把实际参数写进去：

```cpp
int a = plus_one(13);   // a 等于 14
```

调用时参数的个数必须和定义一致，多了少了都报错。

```cpp
plus_one(2, 2);   // 报错
plus_one();       // 报错
```

函数必须先声明后使用，否则编译报错。下面这种"先调用、后定义"的写法编译不过：

```cpp
int a = plus_one(13);   // 报错：此时还不知道 plus_one 是什么

int plus_one(int n) { return n + 1; }
```

解决的办法是先用**函数原型**声明一次，实现放到后面补，见下文。

不返回值的函数，用 `void` 表示返回类型。不接受参数的函数，圆括号里留空即可：

```cpp
void myFunc() {
    // ...
}
```

C 里要写成 `void myFunc(void)`，C++ 的 `()` 本身就表示没有参数，不必再写 `void`。

函数可以调用自身，这叫**递归（recursion）**。下面求斐波那契数列第 `n` 项：

```cpp
long long fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
```

递归能把复杂过程写得很短，但必须有终止条件，否则会无限调用下去。另外竞赛里递归层数太深还会**爆栈**，这一点在《内存管理》一章再说。

## main()

C++ 规定，`main()` 是程序的入口函数，每个程序必须有一个 `main()`。程序总是从它开始执行，没有它就无法启动，其他函数都是直接或间接由它引入的。

`main()` 的写法和普通函数一样，要给出返回类型和参数：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello World\n";
    return 0;
}
```

（这两行是竞赛代码的固定开头：`bits/stdc++.h` 一次引入标准库，`using namespace std;` 免去逐个写 `std::`。代价是编译稍慢、命名空间被污染，工程代码不这么写，竞赛里人人如此。详见《C++ 简介》。）

最后的 `return 0;` 表示函数结束运行，返回 `0`。

约定上，返回 `0` 表示运行成功，返回其他非零整数表示运行失败。系统拿 `main()` 的返回值当作整个程序的返回值，判断是否正常结束。

只有 `main()` 在省略 `return` 时，编译器会自动补上 `return 0`，效果完全一样：

```cpp
int main() {
    cout << "Hello World\n";
}
```

其他函数没有这个待遇。所以建议 `main()` 也显式写 `return 0;`，保持代码风格统一。

还有一点，`main` 是个特殊名字：标准不允许在程序里调用它（包括递归调用自己），别想着拿它当普通函数使。

## 参数的传值引用

**传值（pass by value）**：参数是一个普通变量时，调用传入的是这个变量的**拷贝**，不是变量本身。

```cpp
#include <bits/stdc++.h>
using namespace std;

void increment(int a) {
    a++;
}

int main() {
    int i = 10;
    increment(i);
    cout << i << '\n';   // 10，没有被改到
    return 0;
}
```

`i` 没有变化，因为函数拿到的是 `i` 的拷贝，拷贝怎么改都影响不到原变量。这一节的标题沿用"传值引用"的说法，但更准确的术语是**传值调用（call by value）**——"引用"二字容易和 C++ 的引用混淆，后者下面马上会讲。

如果确实要让函数算出新值，一种办法是把它作为返回值传出来：

```cpp
int increment(int a) {
    return a + 1;
}

int i = 10;
i = increment(i);   // i 变成 11
```

### 引用传参

C 的做法是传地址（`int*`）来改到外部变量，但调用时要写 `&`、函数里要写 `*`，多一层符号。C++ 提供了更直接的**引用（reference）**：给变量起个别名，操作别名等于操作原变量。

```cpp
#include <bits/stdc++.h>
using namespace std;

void increment(int& a) {   // a 是引用
    a++;
}

int main() {
    int i = 10;
    increment(i);
    cout << i << '\n';   // 11
    return 0;
}
```

`int& a` 表示参数 `a` 是一个**引用**：它不是拷贝，而是实参 `i` 的别名。函数里改 `a` 就是改 `i`，所以外面能看到变化。

用引用写交换函数，比指针版干净得多：

```cpp
void swap2(int& x, int& y) {
    int t = x;
    x = y;
    y = t;
}

int main() {
    int a = 1, b = 2;
    swap2(a, b);
    cout << a << ' ' << b << '\n';   // 2 1
    return 0;
}
```

对照指针版：调用要写 `swap2(&a, &b)`，函数体里要写 `*x`、`*y`。引用版调用照常写 `swap2(a, b)`，函数体里直接当普通变量用，读起来轻松。**竞赛里"要改到外部变量"的场景，一律优先用引用，而不是裸指针。**

其实标准库已经有 `std::swap(a, b)` 干这件事，竞赛里直接用它就行，上面两个版本只是用来讲清传参。

### const 引用：传大对象的标准写法

传值要复制一份，参数越大越亏；传引用不复制，但函数有权改它。如果只是"读"这个参数、不想改，就用**常量引用 `const&`**：

```cpp
int sum(const vector<int>& a) {
    int total = 0;
    for (int x : a) total += x;
    return total;
}
```

`const vector<int>&` 的意思是：以引用方式传入（不复制），并且函数承诺不修改它（`const`）。这是竞赛里传容器、传 `string`、传大结构体的标准写法。传值一个几万元素的 `vector`，光拷贝就可能超时；写成 `const&` 则没有这份开销。

有一个例外：`int`、`double`、`char` 这种内置小类型本来就只有一个机器字，传值和传引用开销差不多，直接传值更简单，也省得编译器去处理别名。

### 不要返回内部变量的指针或引用

顺带一个必须避开的错误：函数不要把内部变量的指针（或引用）返回出去。

```cpp
int* f() {
    int i = 0;
    return &i;   // 错误
}
```

函数结束时，内部局部变量 `i` 就销毁了，它占的内存被回收，返回的地址随即失效。外面拿到的是一个**悬垂指针（dangling pointer）**，再去解引用属于未定义行为，可能读到垃圾值，也可能直接崩溃。要返回的数据就该按值返回，编译器会处理好。

## 函数指针

函数本身也是一段放在内存里的代码，可以用指针指向它。指向函数的指针叫**函数指针（function pointer）**。

```cpp
void print(int a) {
    cout << a << '\n';
}

void (*print_ptr)(int) = &print;
```

`print_ptr` 是一个函数指针，指向函数 `print()`。`&print` 取到 `print` 的地址，而函数名本身就代表地址，所以 `print` 和 `&print` 是一回事。写法上，`(*print_ptr)` 外面的圆括号不能省，否则 `(int)` 会和前面的 `*` 结合，变成"返回 `void*` 的函数声明"：

```cpp
void (*print_ptr)(int);   // 函数指针
void* print_ptr(int);     // 一个返回 void* 的函数，含义完全不同
```

有了函数指针，可以像普通函数一样调用它：

```cpp
print_ptr(10);      // 等同于 print(10)
(*print_ptr)(10);   // 也行，两者等价
```

知道这些就够了。竞赛里几乎不会去声明函数指针变量，但有三个地方会碰到它。

**（1）给 `sort` 传自定义比较函数。** `sort` 的第三个参数就是一个函数指针（或 lambda），用来决定"谁排在前面"：

```cpp
#include <bits/stdc++.h>
using namespace std;

bool cmp(int a, int b) {
    return a > b;   // 从大到小
}

int main() {
    vector<int> v = {3, 1, 4, 1, 5};
    sort(v.begin(), v.end(), cmp);
    for (int x : v) cout << x << ' ';
    cout << '\n';   // 5 4 3 1 1
    return 0;
}
```

比较函数 `cmp(a, b)` 返回 `true`，表示 `a` 应该排在 `b` 前面。这个规则必须满足**严格弱序**，否则 `sort` 会出问题甚至越界——最常见的坑是把条件写成 `a >= b`，正确写法是 `a > b`。

**（2）把函数名当参数传。** 上面 `sort(..., cmp)` 里的 `cmp` 就是函数名，它自动退化成函数指针。函数指针也可以写成参数类型，出现在函数原型里：

```cpp
int compute(int (*myfunc)(int), int x) {
    return myfunc(x);
}
```

这句读作："`compute` 的第一个参数是一个函数指针，指向接收 `int`、返回 `int` 的函数。"

**（3）写 lambda。** 竞赛里更常用的写法是就地写一个匿名函数，省去单独定义：

```cpp
sort(v.begin(), v.end(), [](int a, int b) { return a > b; });
```

效果和传 `cmp` 一样。lambda 的细节在后面的章节展开，这里只要认出"`sort` 的第三个参数是个函数"即可。

另外，C 里"函数名前面加不加 `*` 和 `&` 都能调用"的特性在 C++ 里同样成立，但为了可读，日常调用一律直接写函数名。

## 函数原型

函数必须先声明后使用，而程序总是从 `main()` 开始跑。如果所有函数都定义在 `main()` 后面，编译时就找不到它们：

```cpp
void func1() {}
void func2() {}

int main() {
    func1();
    func2();
    return 0;
}
```

这段能编译，是因为 `func1`、`func2` 定义在 `main` 前面。反过来把 `main` 放在最前面就会报错。

可是 `main()` 是程序的主线，放最前面更符合阅读习惯；函数一多，还要费力保证定义顺序。C++ 的解法是：**在文件开头先给出函数原型，函数就可以先使用、后定义**。函数原型只告诉编译器"这个函数长什么样"——返回类型和参数类型，不含函数体，实现放到后面补。

```cpp
int twice(int);

int main() {
    cout << twice(21) << '\n';   // 42
    return 0;
}

int twice(int num) {
    return 2 * num;
}
```

只要开头有原型，`twice()` 的实现放在哪里都行。

函数原型里的参数名可写可不写，对编译器没影响，但写上有助于读代码：

```cpp
int twice(int);
// 等同于
int twice(int num);
```

函数原型以分号结尾，这是它和函数定义最直观的区别。通常一个源码文件的开头会集中列出本章用到的所有函数原型。

## exit()

`exit()` 用来立刻终止整个程序。它在 `<cstdlib>` 里，等价于 C 的 `<stdlib.h>`，只是名字放进了 `std`（被 `bits/stdc++.h` 一并包含，通常不用手写）。

`exit()` 的参数就是程序的返回值。一般用两个常量：`EXIT_SUCCESS`（相当于 0）表示成功，`EXIT_FAILURE`（相当于 1）表示异常中止。它们也定义在 `<cstdlib>`。

```cpp
exit(EXIT_SUCCESS);   // 等同于 exit(0);
exit(EXIT_FAILURE);   // 等同于 exit(1);
```

在 `main()` 里，`exit()` 和执行 `return` 差不多；在其他函数里调用，则直接结束整个程序，函数不会再返回。

不过竞赛里 `exit()` 用得少。想在深层函数里"发现不对就停"，更常见的做法是往上层返回一个错误值，或者用 `assert` 在调试时断言。原因是 `exit()` 会跳过局部对象的析构——竞赛代码里这通常无所谓，但如果程序有需要在退出时写回的数据，就得留意。保险起见，正常结束尽量靠 `return`。

C 还提供了 `atexit()`，用来登记"程序退出时顺带执行"的函数，做一些收尾工作。它也在 `<cstdlib>`：

```cpp
int atexit(void (*func)(void));
```

参数是一个函数指针，指向的函数不能有参数、也不能有返回值。

```cpp
void bye() {
    cout << "goodbye\n";
}

int main() {
    atexit(bye);
    exit(EXIT_FAILURE);   // 先执行 bye()，再退出
}
```

`exit()` 执行时会先调用 `atexit()` 登记过的函数，再真正结束程序。竞赛里基本用不到，知道有这回事即可。

## 函数说明符

这一节先讲几个修饰函数或参数的说明符（`extern`、`static`、`const`），再补上 C++ 相对 C 新增的三件东西：默认参数、函数重载和 `inline`。

### extern 说明符

多文件项目里，当前文件会用到别的文件定义的函数。这时在当前文件给出外部函数的原型，并用 `extern` 说明它的定义在别处：

```cpp
extern int foo(int arg1, char arg2);

int main() {
    int a = foo(2, 3);
    // ...
    return 0;
}
```

函数原型默认就是 `extern`，所以不写 `extern` 效果一样。竞赛通常一个文件写完，几乎不会用到它；多文件的机制见《多文件项目》一章。

### static 说明符

一般情况下，每次调用函数，函数里的局部变量都会重新初始化。`static` 能改变这一点。

`static` 修饰函数内局部变量时，表示这个变量只初始化一次，值在多次调用之间保留：

```cpp
#include <bits/stdc++.h>
using namespace std;

void counter() {
    static int count = 1;   // 只初始化一次
    cout << count << '\n';
    count++;
}

int main() {
    counter();   // 1
    counter();   // 2
    counter();   // 3
    counter();   // 4
    return 0;
}
```

`count` 只初始化一次，之后每次调用都用上一次留下的值，于是依次输出 1、2、3、4。

这种变量的初始化只能写常量，不能写其他变量：

```cpp
int i = 3;
void f() {
    static int j = i;   // 错误：静态变量不能用变量初始化
}
```

另外，`static` 局部变量和全局变量一样，没显式赋值时默认是 0：

```cpp
static int foo;   // 等同于 static int foo = 0;
```

`static` 也能修饰函数本身，表示这个函数只在当前文件可见，别的文件用不了：

```cpp
static int twice(int num) {
    return num * 2;
}
```

`static` 还能出现在数组参数里：

```cpp
int sum_array(int a[static 3], int n) {
    // ...
}
```

这里的 `static` 只是向编译器承诺"数组长度至少为 3"，不改变程序行为，某些情况下有助于优化。`static` 对多维数组参数只对第一维有效。竞赛里基本不写这种用法。

### const 说明符

`const` 用在参数上，表示函数内部不得修改这个参数，最常配合引用或指针使用。

```cpp
void f(int* p) {
    *p = 0;   // 能改到外面
}

void g(const int* p) {
    // *p = 0;   // 报错：不能改 p 指向的值
}
```

`const int* p` 限制的是 `*p` 不能改，但 `p` 自己（指向哪里）仍可以改：

```cpp
void h(const int* p) {
    int x = 13;
    p = &x;   // 允许：只是改了指针自己
}
```

想限制 `p` 本身，把 `const` 放到 `*` 后面：

```cpp
void k(int* const p) {
    int x = 13;
    // p = &x;   // 报错：p 不能被重新指向
}
```

两个都限制，就写两个 `const`：

```cpp
void m(const int* const p) {
    // 既不能改 *p，也不能改 p
}
```

读这类声明有个口诀：**`const` 从右往左读**——`const int* p` 读作"p 是一个指针，指向 const int"。竞赛里真正高频的是引用版 `const T&`，前面讲过了，它是传大对象的标配。

### 默认参数

C++ 允许函数参数带**默认值（default argument）**。调用时不给这个参数，就用默认值：

```cpp
void greet(string name, string prefix = "Hello") {
    cout << prefix << ", " << name << "!\n";
}

greet("Alice");           // Hello, Alice!
greet("Bob", "Hi");       // Hi, Bob!
```

规则有两条要记住：

- 带默认值的参数必须排在参数列表**末尾**。写成 `void f(int a = 1, int b)` 是非法的。
- 同一个参数的默认值只能给一次。通常写在函数原型里；原型和定义都写同一个参数的默认值，会报错。

```cpp
int add(int a, int b = 10);   // 原型里给默认值

int main() {
    cout << add(1) << '\n';    // 11
    return 0;
}

int add(int a, int b) {        // 定义里不再重复写默认值
    return a + b;
}
```

竞赛里默认参数用得不多，主要出现在自己写的工具函数里，给"不常改的选项"一个省事的缺省值。

### 函数重载

**函数重载（overloading）**指同一个名字下有多个函数，只要参数列表不同，编译器会自动挑一个匹配的：

```cpp
int max_of(int a, int b) { return a > b ? a : b; }
double max_of(double a, double b) { return a > b ? a : b; }
```

两个都叫 `max_of`，但一个吃 `int`、一个吃 `double`。调用 `max_of(3, 5)` 选第一个，`max_of(1.5, 2.5)` 选第二个。

区分重载只看**参数列表**（参数个数和类型），返回类型不参与。所以下面这样只改返回类型是不行的：

```cpp
int f(int a);
double f(int a);   // 错误：参数列表相同，不构成重载
```

重载在竞赛里主要体现为标准库：`max`、`min`、`abs`、`sort` 等都有多个版本，靠参数类型自动匹配。自己写重载时要小心类型自动转换带来的歧义，比如同时有 `f(int)` 和 `f(double)` 时，传一个 `char` 到底选哪个就可能有意外。

### inline 说明符

`inline` 建议编译器把这个小函数的代码直接展开到调用处，省掉函数调用本身的开销。

```cpp
inline int square(int x) {
    return x * x;
}
```

对竞赛来说，`inline` 有两层意义。

一是**性能**：频繁调用的小函数（比如取模、比较）加上 `inline` 可能快一点。但现代编译器在开 `-O2` 后基本会自动决定要不要内联，手写 `inline` 更多是"提个建议"，不保证一定生效。

二是**避免重复定义**。如果多个 `.cpp` 文件都出现同一个函数定义，链接时会报重复定义；在函数定义前加 `inline`，可以让多个文件各自持有一份而不冲突。这也是在头文件里写函数定义时必须加 `inline` 的原因。

另外，类的成员函数写在类内时天然就是 `inline` 的，不需要额外标注。

## 可变参数

有些函数的参数个数不固定，声明时可以用省略号 `...` 表示"后面还有若干个参数"，这叫做**可变参数（variadic arguments）**。标准库里的 `printf` 就是这样：

```cpp
int printf(const char* format, ...);
```

`...` 必须放在参数列表最后，否则报错。

处理可变参数要用 `<cstdarg>` 里的一组宏（等价于 C 的 `<stdarg.h>`，被 `bits/stdc++.h` 一并包含）：

- `va_list`：保存可变参数状态的对象，操作前必须先定义它。
- `va_start`：初始化这个对象。第二个参数是"可变参数之前的那一个具名参数"，用来定位起点。
- `va_arg`：按顺序取出下一个参数，要指明它的类型。
- `va_end`：用完清理。

下面是一个求平均值的例子：

```cpp
#include <bits/stdc++.h>
using namespace std;

double average(int n, ...) {
    double total = 0;
    va_list ap;
    va_start(ap, n);                 // 从 n 之后的参数开始
    for (int i = 0; i < n; i++)
        total += va_arg(ap, double); // 依次取出 double
    va_end(ap);
    return total / n;
}
```

`va_start(ap, n)` 把 `n` 后面的参数交给 `ap` 管理，`va_arg(ap, double)` 每调用一次取一个 `double`，`va_end(ap)` 收尾。可变参数不做类型检查：取值时写错类型（比如实参是 `int` 却取成 `double`），编译器不会拦你，运行时得到的就是一堆乱值。所以"有几个参数、各是什么类型"只能靠约定，`printf` 的约定就是格式字符串里的占位符。

竞赛里基本不用可变参数。理由很直接：它绕过了类型系统和编译期检查，容易出错；而 C++ 有更好的替代。

参数个数不多、类型相同时，直接传 `initializer_list`：

```cpp
int sum(initializer_list<int> nums) {
    int total = 0;
    for (int x : nums) total += x;
    return total;
}

cout << sum({1, 2, 3, 4}) << '\n';   // 10
```

个数不固定、又要按下标访问时，传一个 `vector<int>`。调用方写 `sum({1, 2, 3})` 或 `sum(v)`，都比 `va_list` 清晰，还能享受类型检查。

所以这一节当作"读得懂标准库签名"的背景知识即可，自己写代码时优先 `initializer_list` 或 `vector`。
