---
title: "结构体"
description: "用 struct 把相关的几个值打包成一个类型，并让它带上成员函数、构造函数和排序规则。"
---
# 结构体

## 简介

数组能一次存很多值，但所有值必须是同一类型。写题时常遇到几个不同类型的值需要绑定在一起的情况：一个点的坐标是横纵两个量，一条边有两端点和边权，一个区间有左右端点。用一组平铺的变量表示时，声明要写一长串，排序、传参、存入容器都要分别处理每个变量。

C++ 用 `struct` 关键字定义**结构体**（structure），把若干**成员**（member）打包成一个新的类型：

```cpp
struct Point {
    int x;
    int y;
};
```

**C++ 里 `Point` 本身就是类型名**，声明变量和声明一个 `int` 一样：

```cpp
Point p;
p.x = 1;    // 用点号访问成员
p.y = 2;
```

`p.x` 读作“变量 `p` 的成员 `x`”，点号 `.` 是成员访问运算符。`typedef` 用于给类型起别名，C++ 中不需要把它和结构体定义写在一起，详见《typedef 与 using》一章。

定义结构体时最后那个分号不能漏，这是最常见的编译错误之一。类型定义和变量声明也能合并成一个语句：

```cpp
struct Point {
    int x, y;
} p1, p2;      // 同时定义了类型 Point 和两个变量
```

如果这个类型只在这里用一次，类型名可以省掉，这种叫匿名结构体：

```cpp
struct {
    int x, y;
} p;
```

匿名结构体的优点是不需要命名，缺点是无法再用来声明第二个变量，也不能作为函数参数。竞赛代码除临时打包少量值外，都为类型命名。

**聚合初始化**（aggregate initialization） 用一对大括号一次给所有成员赋值：

```cpp
Point a{1, 2};      // x = 1，y = 2
Point b = {1, 2};   // 老写法，等价
Point c{};          // 全零
```

大括号里的值按成员的声明顺序对应。给的值少于成员数时，剩余成员按 0 初始化，所以 `Point c{};` 就是 `(0, 0)`。该性质常用于数组初始化：`Point pts[N]{};` 得到的数组元素全为 0，不需要再写循环清零。

C++20 起还能写成 `Point p{.y = 2};` 这样按成员名指定，但竞赛平台的编译器不一定开到 C++20，不要依赖它。

结构体的成员占用内存的总数并不等于各成员大小之和，编译器会在成员之间插入空隙做**内存对齐**（memory alignment），让每个成员都落在便于访问的地址上：

```cpp
struct Foo {
    int a;      // 4 字节
    char* b;    // 8 字节（64 位平台）
    char c;     // 1 字节
};

cout << sizeof(Foo) << '\n';   // 24，不是 4 + 8 + 1 = 13
```

64 位平台上指针按 8 字节对齐，于是 `int a` 后面补 4 字节空位、`char c` 后面补 7 字节，合计 3 个 8 字节。把成员按占用空间从小到大排列能减少填充：

```cpp
struct Foo {
    char c;     // 1 字节
    int a;      // 4 字节
    char* b;    // 8 字节
};

cout << sizeof(Foo) << '\n';   // 16
```

竞赛代码很少为节省这部分空间而重排成员。填充（padding）字节的内容不确定，因此按字节比较两个结构体（比如 `memcmp`）不可靠，这一点在《内存管理》一章里提过。

结构体也可以定义数组，用法和普通数组一样：

```cpp
Point pts[1000];

pts[0].x = 22;
pts[0].y = 7;
```

## 成员函数与构造函数

C++ 的结构体里不光能放数据，还能放函数，这类函数叫**成员函数**（member function）：

```cpp
struct Point {
    int x, y;

    int dist2() const {        // 到原点距离的平方
        return x * x + y * y;
    }

    void move(int dx, int dy) {
        x += dx;
        y += dy;
    }
};

Point p{3, 4};
cout << p.dist2() << '\n';   // 25
p.move(1, 1);                // p 变成 (4, 5)
```

成员函数体里可以直接写成员名，`x` 就是 `p.x`。函数名后面那个 `const` 表示这个函数不修改成员变量，加不加都不影响竞赛里跑出正确结果，加上更规范。

**构造函数**（constructor） 是一类特殊的成员函数：名字与结构体同名、没有返回类型，变量的创建过程会自动调用它。它的作用是在创建对象时完成初始化，使对象处于合法状态，比如并查集里每个点最初都指向自己：

```cpp
struct DSU {
    vector<int> fa;

    DSU(int n) : fa(n) {              // 冒号后面是初始化列表
        for (int i = 0; i < n; i++)
            fa[i] = i;
    }

    int find(int x) {
        return fa[x] == x ? x : fa[x] = find(fa[x]);
    }
};

DSU d(10);      // 传进 n = 10，fa 已经建好并初始化
```

`: fa(n)` 表示用 `n` 去构造成员 `fa`，效果和函数体里写 `fa.resize(n)` 一样，但效率更高。

**自定义构造函数后，聚合初始化的含义发生变化**：`Point a{1, 2}` 是构造函数调用，不再是大括号直接填成员。所以竞赛里常见的写法是给每个参数带上默认值：

```cpp
struct Point {
    int x, y;

    Point(int x = 0, int y = 0) : x(x), y(y) {}
};

Point a;         // (0, 0)
Point b{1, 2};   // (1, 2)
```

这样 `Point a;`、`Point b{1, 2}` 两种写法都能用。如果不需要保证创建时的合法性，可以不定义构造函数，继续使用大括号初始化。

## struct 与 class 的区别

C++ 还有一个关键字 `class`，用来定义类（class）。它和 `struct` 几乎是同一个东西，唯一区别是**默认访问权限**：`struct` 的成员默认 `public`，外部可以直接访问；`class` 的成员默认 `private`，外部不能访问。在 `class` 里写上 `public:` 之后，两者就完全一样了。

所以本章讲的所有用法，把 `struct` 换成 `class` 都成立。竞赛代码通常使用 `struct`：纯数据的打包不需要封装，也省掉一行 `public:`。

## 排序：operator< 与比较函数

数据打包之后通常需要排序。对结构体数组调用 `std::sort` 时，需要给出元素之间的先后规则。

常用做法是为结构体重载小于运算符 `operator<`（overload），`sort` 默认使用它：

```cpp
struct Edge {
    int u, v, w;

    bool operator<(const Edge& o) const {
        return w < o.w;             // 按边权从小到大
    }
};

vector<Edge> es = {{1, 2, 3}, {2, 3, 1}, {1, 3, 2}};
sort(es.begin(), es.end());         // 结果：{2,3,1}、{1,3,2}、{1,2,3}
```

`operator<` 的参数写成 `const Edge& o`，表示“按引用接收另一个 `Edge`，并承诺不修改它”：`&` 省掉一次复制，`const` 是标准库的要求，加上更规范。

另一种做法是写一个比较函数，作为 `sort` 的第三个参数传进去：

```cpp
bool cmp(const Edge& a, const Edge& b) {
    return a.w < b.w;
}

sort(es.begin(), es.end(), cmp);
```

不想为一次排序单起一个函数名，可以就地写 lambda：

```cpp
sort(es.begin(), es.end(), [](const Edge& a, const Edge& b) {
    return a.w < b.w;
});
```

比较函数必须满足**严格弱序**（strict weak ordering），其中关键的一条是：元素与自身比较的结果必须为“假”。所以不能写 `a.w <= b.w`：两个权值相等的元素会互相判为“小于”，`sort` 可能越界访问内存，产生运行时错误。比较函数只写 `<`，不写 `<=`。

按多个关键字排序时，依次比较即可：

```cpp
bool operator<(const Edge& o) const {
    if (w != o.w) return w < o.w;   // 先看边权
    return u < o.u;                 // 边权相同再看起点
}
```

## struct 的复制

结构体变量之间可以直接赋值，赋值会**逐成员复制**，得到一个独立的新对象：

```cpp
struct Cat {
    string name;
    int age;
};

Cat a{"Hula", 3};
Cat b = a;         // 复制出一份完整的副本
b.name[0] = 'M';

cout << a.name << '\n';   // Hula
cout << b.name << '\n';   // Mula
```

改 `b` 影响不到 `a`。这跟数组完全不同——数组不能整体赋值，只能逐元素复制（或者用 `memcpy`）。

不过“复制出一份”的前提是成员本身支持复制。成员若是裸指针，复制过去的只是指针值，两个对象会指向同一块内存，改一个另一个跟着变，这叫浅拷贝（shallow copy）：

```cpp
struct Cat {
    char* name;    // 裸指针
    int age;
};

Cat a;
a.name = (char*)"Hula";

Cat b = a;         // b.name 与 a.name 是同一个地址
```

使用 `string` 或 `vector` 作为成员时不会出现该问题：它们自行管理内存，复制时复制的是内容。这也是竞赛代码优先使用 `string`、`vector` 而非裸指针的原因之一。

新类型的相等比较同样要自己写，C++ 不会自动生成逐成员比较的规则：

```cpp
struct Point {
    int x, y;

    bool operator==(const Point& o) const {
        return x == o.x && y == o.y;
    }
};

cout << (Point{1, 2} == Point{1, 2}) << '\n';   // 1
```

结构体还能当函数参数和返回值，默认是“传值”，也就是每次调用都复制一份实参。结构体一大，这份开销就不能忽略，想避免可以按引用传 `const Point&`，见《函数》一章。

## struct 指针

结构体变量传给函数时，函数拿到的是副本：

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Turtle {
    string name;
    int age;
};

void happy(Turtle t) {
    t.age += 1;
}

int main() {
    Turtle myTurtle{"MyTurtle", 99};
    happy(myTurtle);
    cout << myTurtle.age << '\n';   // 99，没有变
    return 0;
}
```

要修改调用方持有的对象，需要传入指针或引用。

```cpp
void happy(Turtle* t) {     // 传指针
    t->age += 1;            // 指针用箭头 -> 取成员
}

void happy(Turtle& t) {     // 传引用
    t.age += 1;             // 引用的写法与普通变量一致
}

happy(&myTurtle);   // 指针版本：调用时要取地址
happy(myTurtle);    // 引用版本：调用时不带 &
```

竞赛代码中引用更常见；链表、树的节点里普遍使用指针，需要具备阅读指针写法的能力。注意结构体与数组不同，结构体变量名本身不是地址，取地址必须写 `&myTurtle`。

通过指针访问成员有两种等价写法：

```cpp
// 设 ptr 是 myStruct 的指针，即 ptr == &myStruct
myStruct.prop == (*ptr).prop == ptr->prop
```

`(*ptr).prop` 的括号不能省。`.` 的优先级比 `*` 高，`*ptr.prop` 会被解析成 `*(ptr.prop)`，先取成员再解引用，含义完全不同。

## struct 的嵌套

结构体的成员可以是另一个结构体。竞赛里常见的组织方式是一个查询带编号和区间，区间又有左右端点：

```cpp
struct Range {
    int l, r;
};

struct Query {
    int id;
    Range rg;
};

Query q{1, {2, 5}};          // 嵌套的大括号按层对应
cout << q.rg.l << '\n';      // 2：取值时逐层用点号
```

内层也可以先建好再放进去：

```cpp
Range rg{2, 5};
Query q{1, rg};
```

取值时需逐层写点号 `q.rg.l`，嵌套层次较多时容易漏写某一层，竞赛代码的嵌套通常不超过两层。

结构体还能引用自己，但只能引用自己的指针——如果直接放一个自己的成员，编译器算不出这个类型有多大：

```cpp
struct Node {
    int data;
    Node* next;      // C++ 里不用写 struct Node*
};

Node* head = new Node{11, nullptr};
head->next = new Node{22, nullptr};

for (Node* cur = head; cur != nullptr; cur = cur->next)
    cout << cur->data << '\n';   // 11 22
```

这是链表的基本实现。竞赛里的链表一般用数组模拟（`nxt[i]` 存下一个下标）或 `vector`，因为 `new` 分配的节点分散在堆中、访问较慢，且需要手动释放。结构体中存放自身指针的写法在树、图的邻接表中普遍存在。

## 位字段

结构体的成员可以指定只占几个二进制位，这种成员叫**位字段**（bit field）：

```cpp
struct Flags {
    unsigned int a : 1;   // 只占 1 位
    unsigned int b : 1;
    unsigned int c : 1;
    unsigned int d : 1;
};

Flags f{};
f.b = 1;
```

成员名后面的 `:1` 是位宽，所以 `Flags` 一共 4 个二进制位。位字段的成员只能是整数类型。还有两种细节写法：不写成员名表示这些位留着不用；位宽写 `0` 表示“从这里跳到下一个存储单元”。

```cpp
struct Stuff {
    unsigned int field1 : 1;
    unsigned int        : 2;   // 空 2 位做填充
    unsigned int field2 : 1;
    unsigned int        : 0;   // 强行跳到下一个存储单元
    unsigned int field3 : 1;
};
```

竞赛里基本不用位字段。需要按位存储状态（状态压缩、子集枚举）时，直接用整数做位运算是通行做法：`s & (1 << k)` 判断第 `k` 位，`s | (1 << k)` 置位。位字段还有两点限制：具体的内存布局由编译器决定，换编译器可能不同；位字段没有独立地址，无法取地址。它属于底层知识，了解即可。

## 弹性数组成员

结构的最后一个成员可以写成不指定长度的数组，长度留到分配内存时再定，这叫**弹性数组成员**（flexible array member）：

```cpp
struct vstring {
    int len;
    char chars[];   // 长度待定
};
```

使用的时候，把结构体自身的大小和数组需要的大小加在一起申请：

```cpp
struct vstring* str = malloc(sizeof(struct vstring) + n * sizeof(char));
str->len = n;
```

数组的成员数由 `n` 决定，`n` 在运行时才能确定。

它有两条规则：弹性数组必须是最后一个成员；前面至少还要有另一个成员。另外，这是 C99 的特性，**C++ 标准里没有**，GCC 把它当扩展允许，代码就不可移植了。

C++ 里用不到它。需要变长数组用 `vector`，需要变长字符串用 `string`，两者都负责分配内存、维护长度，还能随时扩容，比手动管理一段内存可靠：

```cpp
vector<char> chars(n);   // n 个 char，还能继续 push_back
string s;                // 长度由 string 自己维护
```
