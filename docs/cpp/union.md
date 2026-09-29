---
title: "联合体"
description: "联合体（union）的多个成员共用同一块内存，同一时刻只有一个成员有效。本章通过它说明数据的内存布局，竞赛中基本不使用。"
---
# 联合体

有时需要一种数据类型，在不同的场合表示不同的东西。比如衡量水果的“量”，有时是整数（6 个苹果），有时是浮点数（1.5 公斤草莓）。

C 语言为此提供了 Union 结构，C++ 沿用下来，中文译作**联合体（union）**。联合体内部可以声明多个成员，但它们**共用同一块内存**：所有成员都是对同一段二进制数据的不同解读方式，同一时刻通常只有一个解读是有意义的。往里写某个成员，会覆盖上一个成员留下的字节；反过来说，这块内存可以先当一个成员用，再当另一个成员用。它最大的好处是省空间。

竞赛代码里几乎不用联合体，但它的内存布局说明了变量是“一段字节加一种解读方式”。

## 联合体的定义

```cpp
union quantity {
    short count;    // 2 字节
    float weight;   // 4 字节
    float volume;   // 4 字节
};
```

上面用 `union` 定义了一个叫 `quantity` 的类型，包含三个成员。注意它和结构体 `struct` 的区别：`struct` 的三个成员各占一块内存，总大小是三者相加（还要算上对齐填充）；`union` 的三个成员叠在同一个地址上，总大小取最长的那一个，这里是 4 字节。

和结构体一样，C++ 里定义完就能直接用类型名声明变量，**不需要**像 C 那样写 `union quantity q;`——`quantity` 本身就已经是类型名了。

```cpp
quantity q;     // C++ 里这样写就行
```

## 赋值与解读

每次给联合体成员赋值，等于选择“现在按哪个成员解读这段内存”。

```cpp
quantity q;
q.count = 4;                    // 现在按 short 解读

quantity q2{4};                 // 花括号初始化：值给第一个成员 count

quantity q3{.count = 4};        // 指定成员名，C++20 起支持
```

最后一种写法在 C++17 上会报错，它是 C99 引入、C++20 才补进标准的语法，用之前先确认编译标准。

写入之后，只有刚写过的那个成员能读出有意义的值：

```cpp
cout << q.count << '\n';        // 4，刚写过它

cout << q.weight << '\n';       // 危险：这段字节不是按 float 写进去的
```

第二行的结果在 C++ 里属于**未定义行为（undefined behavior）**——标准没有规定“按另一个成员读”会发生什么。C 语言对联合体的这类读取相对宽松，C++ 则明确把它划进未定义行为的范围，不要依赖。

换个成员再写一遍，原来的成员就跟着变了：

```cpp
q.weight = 0.5f;
cout << q.weight << '\n';       // 0.5
cout << q.count << '\n';        // 已被覆盖，读出来的东西和 4 无关
```

## 指针

联合体支持指针运算，规则和结构体一样，用 `->` 访问成员：

```cpp
#include <bits/stdc++.h>
using namespace std;

union quantity {
    short count;
    float weight;
    float volume;
};

int main() {
    quantity q;
    q.count = 4;

    quantity* ptr = &q;
    cout << ptr->count << '\n';      // 4，等价于 q.count
    return 0;
}
```

`ptr->count` 就是 `q.count`。下面这种写法存在风险。

三个成员的起始地址相同，`&q` 既可解释为 `short*`，也可解释为 `float*`。把地址强制转换成某个成员类型的指针，写法如下：

```cpp
union foo {
    int a;
    float b;
} x;

x.a = 12;

int*   p_int   = (int*)&x;      // 能编译，但不安全
float* p_float = (float*)&x;
```

这段代码绕过类型系统，把联合体的地址当成 `int*` 直接解读同一段内存，这种做法叫**类型双关（type punning）**。C++ 标准同样不保证它的行为（严格说违反了**严格别名规则**，strict aliasing）。按字节搬运数据应使用 `memcpy`：

```cpp
#include <bits/stdc++.h>
using namespace std;

union foo {
    int a;
    float b;
};

int main() {
    foo x;
    x.a = 12;

    int a2;
    memcpy(&a2, &x, sizeof(a2));        // 逐字节复制，安全
    cout << x.a << ' ' << a2 << '\n';   // 12 12

    x.b = 3.141592f;

    float b2;
    memcpy(&b2, &x, sizeof(b2));
    cout << x.b << ' ' << b2 << '\n';   // 3.14159 3.14159
    return 0;
}
```

`memcpy` 来自 `<cstring>`（等价于 C 的 `<string.h>`，被 `bits/stdc++.h` 一并包含），它只搬字节、不做类型解读，因此没有别名问题。C++20 提供了 `std::bit_cast`，语义更明确，作用相同。

## 起别名

C 里习惯用 `typedef` 给联合体起别名：

```cpp
typedef union {
    short count;
    float weight;
    float volume;
} quantity;
```

这是“匿名联合体 + 类型别名”的写法。不过在 C++ 里这层 `typedef` 是多余的：前面 `union quantity { ... };` 定义出的 `quantity` 已经是类型名，可以直接拿去声明变量。给别的类型起别名时也一样，C++ 更推荐 `using`：

```cpp
using Real = long long;     // 比 typedef long long Real; 好读
```

## 限制

联合体成员受标准的额外约束，其中一条是：**成员不能是需要构造、析构或拷贝的类型**。

```cpp
union bad {
    string s;       // 报错：string 有非平凡的构造 / 析构函数
    int i;
};
```

`string`、`vector` 这类类型管理着自己的资源（动态内存），构造时要分配、析构时要释放。联合体无法确定该调用哪个成员的构造函数、该析构哪个成员，因此不允许这类成员。若要把这类成员放进联合体，须自己定义构造函数、析构函数和拷贝行为（再配合“placement new”按需构造），代码复杂度明显增加。竞赛里没有这种用法，用 `struct` 或者 C++17 的 `variant` 即可。

另一个限制仍是类型双关：读取非最后写入的成员是未定义行为。“`&x` 的类型完全由当前赋值的成员决定”这句话只描述了地址这一层，不构成随意转换指针的依据。

## 好处

联合体唯一实在的好处是**省空间**：三个成员共用一块内存，同一时间只用一个，就等于省下另外两个的空间。联合体占用的字节数等于最长成员的长度，再按对齐要求向上取整。

| 类型 | 典型大小 | 说明 |
| --- | --- | --- |
| `struct { short; float; float; }` | 12 字节 | 三个成员各占各的 |
| `union { short; float; float; }` | 4 字节 | 三个成员叠在同一地址 |

另一个用途是联合体与“标签”搭配：用另一个字段记录当前有效的是哪个成员，这种做法叫**标签联合（tagged union）**。C++17 的标准库类型 `std::variant` 是它的类型安全实现。

本节内容的作用在于说明内存布局。竞赛题里几乎不会用到联合体；需要在同一段内存上做多种解释的场景，用 `memcpy`、`bit_cast` 或 `variant` 都比裸的联合体可靠。
