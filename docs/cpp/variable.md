---
title: "变量"
description: "变量（variable）是一块内存区域的名字。通过变量名就能读写这块内存里存的值。值可以改变，所以叫变量；不能改变的就是常量。"
---
# 变量

变量（variable）是一块内存区域的名字。通过变量名可以读写这块内存中存储的值。值可以变化，所以叫变量；不能变的则是常量。

## 变量名

变量名属于**标识符（identifier）**，命名有严格规定：

- 只能由字母、数字和下划线 `_` 组成；
- 不能以数字开头；
- 区分大小写——`star`、`Star`、`STAR` 是三个不同的变量。

下面这些变量名都不合法：

```cpp
$zj
j**p
2cat
Hot-tab
tax rate
don't
```

有些词在语言里有特殊含义，不能拿来当变量名，它们叫**关键字（keyword）**。C++ 的关键字列举如下：

> alignas, alignof, auto, bool, break, case, catch, char, class, const, constexpr, continue, default, delete, do, double, else, enum, explicit, extern, false, float, for, friend, goto, if, inline, int, long, mutable, namespace, new, noexcept, nullptr, operator, private, protected, public, register, reinterpret_cast, return, short, signed, sizeof, static, static_cast, struct, switch, template, this, throw, true, try, typedef, typename, union, unsigned, using, virtual, void, volatile, while

此外，两个下划线开头、或一个下划线加大写字母开头的名字（如 `__tmp`、`_Foo`）是系统保留的，不应作为变量名。

## 变量的声明

C++ 的变量**必须先声明后使用**。声明时要告诉编译器它的类型（type）：

```cpp
int height;
```

上面声明了一个 `int`（整数）类型的变量 `height`。类型相同的话，可以一行声明多个：

```cpp
int height, width;

// 等同于
int height;
int width;
```

声明语句以分号结尾。一旦声明，类型在运行时不能改变。

C++ 还提供了另外两种声明写法。

**（1）列表初始化。** 用一对花括号给出初始值，写在声明处：

```cpp
int num{42};
```

花括号初始化不允许窄化转换，编译器会拦下放不进的值（比如用 `{1.5}` 去初始化 `int` 会报错），可以在编译期发现类型不匹配。

**（2）`auto` 自动推导。** 由编译器根据初始值推导类型：

```cpp
auto x = 1;      // x 是 int
auto y = 1.5;    // y 是 double
```

`auto` 要求声明处同时提供初始值，没有初始值时编译器无法推导类型。竞赛里遇到较长的类型（比如迭代器）时，用 `auto` 可以简化声明。

## 变量的赋值

C++ 在声明变量时就分配了内存，但**不会**清空其中的内容。所以局部变量声明后如果没赋值，它的值是随机的，必须赋值之后才能用：

```cpp
int num;
num = 42;
```

赋值用赋值运算符 `=`。它左边的值会被右边的值覆盖。

值的类型应该和变量匹配。`int` 用于存储整数，存储小数时 C++ 会自动做隐式转换，可能损失精度。

声明和赋值也能写在一起：

```cpp
int num = 42;
int x = 1, y = 2;
```

C++ 中**全局变量**和 `static` 变量如果没显式赋值，会被自动清零。函数内的 `auto` 局部变量（即不带 `static` 的局部变量）不适用这条规则，声明后值是随机的，必须先赋值再使用。竞赛代码常把数组开成全局的，为的是得到“自动初始化成 0”。

赋值表达式本身有值，等于等号右边的值，因此可以连环赋值：

```cpp
int x, y;
x = 1;
y = (x = 2 * x);   // y 等于 2

int a, b, c;
a = b = c = 3;     // 从右往左，依次赋值
```

C++ 有**左值（lvalue）**和**右值（rvalue）**的概念。左值能放在 `=` 左边（一般是变量），右值只能放右边（一般是具体的值）。`x = 1` 合法，`1 = x` 会报错，就是这条规则的体现。

## 变量的作用域

**作用域（scope）**指变量生效的范围。C++ 的变量主要有两种作用域：文件作用域和块作用域。

**文件作用域（file scope）**：在源码文件最外层声明的变量，从声明处到文件结尾都有效。

```cpp
#include <bits/stdc++.h>
using namespace std;

int x = 1;

int main() {
    cout << x << '\n';   // 1
}
```

**块作用域（block scope）**：由大括号 `{}` 界定的代码块是一个独立作用域。在块里声明的变量只在这个块里有效，出了块就不能访问。

```cpp
int a = 12;

if (a == 12) {
    int b = 99;
    cout << a << ' ' << b << '\n';   // 12 99
}

cout << a << '\n';   // 12
cout << b << '\n';   // 报错：b 已经出了作用域
```

代码块可以嵌套，于是形成多层作用域。规则是：**内层能用外层声明的变量，外层不能用内层声明的变量**。如果内层声明了同名的变量，它会遮蔽外层的那个变量。

```cpp
{
    int i = 10;
    {
        int i = 20;
        cout << i << '\n';   // 20，内层的 i
    }
    cout << i << '\n';       // 10，外层的 i
}
```

函数是最常见的块作用域：函数内部声明的变量在函数外不可访问。`for` 循环同样构成块作用域，循环变量出了循环就不能使用：

```cpp
for (int i = 0; i < 10; i++)
    cout << i << '\n';

cout << i << '\n';   // 报错：i 只在循环里有效
```

上面 `for` 省略了大括号，但循环体依然是一个块作用域，所以循环外读 `i` 会报错。同一个函数里想用两个 `for` 各自的循环变量，用 `int i` 声明两遍不会冲突，因为它们是各自块里的 `i`。
