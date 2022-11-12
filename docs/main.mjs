const { BigInt, Number, NaN, requestAnimationFrame } = globalThis;
const { MAX_SAFE_INTEGER } = Number;
const { assign } = Object;
const { sqrt, floor } = Math;
const { setPrototypeOf } = Reflect;
const requestAnimationFrameCallback = r => requestAnimationFrame(r);
const createElement = document.createElement.bind(document);
const isWithPrefix = RegExp.prototype.exec.bind(
  Object.setPrototypeOf(/^0(?:b[01]+|o[0-7]+|x[\da-f]+)$/i, null)
);
const addTypeInfo = (o, type) => {
  setPrototypeOf(o, null);
  o.type = type;
  return o;
};
const newtonIteration = (n, x0) => {
  const x1 = ((n / x0) + x0) >> 1n;
  if (x0 === x1 || x0 === (x1 - 1n)) return x0;
  return newtonIteration(n, x1);
};
const clampedRoot = (n) => {
  if (n < 0) return -clampedRoot(-n);
  if (n < 2) return n;
  return newtonIteration(n, 1n);
};
const divEuclid = (a, b) => {
  if (b < 0n) return -divEuclid(-a, -b);
  if (a < 0n) a = -a;
  if(a < b) {
    const tmp = a;
    a = b;
    b = tmp;
  }
  let r = a % b;
  while (r) {
    a = b;
    b = r;
    r = a % b;
  }
  return b;
};
const solveQuadratic = async (a, b, c) => {
  a = BigInt(a);
  b = BigInt(b);
  c = BigInt(c);
  1n / a; // It is not allowed variable 'a' to be equal to 0
  let d = b ** 2n - 4n * a * c;
  if (d === 0n) {
    let k = -b, l = 2n * a;
    if (k && l) {
      const cd = divEuclid(k, l);
      k /= cd, l /= cd;
    }
    return addTypeInfo([k, l], "dup");
  }
  const rootD = clampedRoot(d);
  if (d === rootD ** 2n) {
    let k = -rootD - b, l = rootD - b, m = 2n * a, n = m;
    if (k && m) {
      const cd1 = divEuclid(k, m);
      k /= cd1, m /= cd1;
    }
    if (l && n) {
      const cd2 = divEuclid(l, n);
      l /= cd2, n /= cd2;
    }
    return addTypeInfo([
      [k, m],
      [l, n]
    ], "rat");
  }
  let k = -b, l = 1n, m = d, n = 2n * a;

  while (!(m % 4n)) m /= 4n, l *= 2n;
  for (let i = 3n; i <= rootD; i += 2n) {
    const sq = i ** 2n;
    while (!(m % sq)) m /= sq, l *= i;
    if (!(i % 131071n)) await new Promise(requestAnimationFrameCallback);
  }

  if (k && l && n) {
    const cd = divEuclid(divEuclid(l, k), n);
    k /= cd, l /= cd, n /= cd;
  } else if (l && n) {
    const cd = divEuclid(l, n);
    l /= cd, n /= cd;
  }
  if (l < 0) l = -l;
  return addTypeInfo([k, l, m, n], "irr");
};
const element = ({ tag, style = {}, children = [] }) => {
  const e = createElement(tag);
  assign(e.style, style);
  children.forEach(v => e.append(v));
  return e;
};
const resultToHTML = (ret) => {
  switch (ret.type) {
    case "dup": {
      const children = [element({
        tag: "div",
        style: {
          textAlign: "center"
        },
        children: [`${ret[0]}`]
      })];
      if (0n !== ret[0] && 1n !== ret[1])
        children.push(element({
          tag: "div",
          style: {
            textAlign: "center",
            borderTop: "1px solid #fff"
          },
          children: [`${ret[1]}`]
        }));
      return element({
        tag: "div",
        style: {
          display: "inline-block"
        },
        children
      });
    }
    case "rat": {
      const children1 = [element({
        tag: "div",
        style: {
          textAlign: "center"
        },
        children: [`${ret[0][0]}`]
      })];
      if (0n !== ret[0][0] && 1n !== ret[0][1])
        children1.push(element({
          tag: "div",
          style: {
            textAlign: "center",
            borderTop: "1px solid #fff"
          },
          children: [`${ret[0][1]}`]
        }));
      const children2 = [element({
        tag: "div",
        style: {
          textAlign: "center"
        },
        children: [`${ret[1][0]}`]
      })];
      if (0n !== ret[1][0] && 1n !== ret[1][1])
        children2.push(element({
          tag: "div",
          style: {
            textAlign: "center",
            borderTop: "1px solid #fff"
          },
          children: [`${ret[1][1]}`]
        }));
      return element({
        tag: "div",
        style: {
          display: "inline-block"
        },
        children: [element({
          tag: "div",
          style: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
          },
          children: [element({
            tag: "div",
            children: children1
          }),
          element({
            tag: "div",
            children: [element({
              tag: "span",
              style: { whiteSpace: "pre" },
              children: [", "]
            })]
          }),
          element({
            tag: "div",
            children: children2
          })]
        })]
      });
    }
    case "irr": {
      const first = element({
        tag: "div",
        style: {
          textAlign: "center"
        }
      });
      if (0n !== ret[0])
        first.appendChild(element({
          tag: "span",
          children: [`${ret[0]}`]
        }));
      const plusmn = element("span");
      first.appendChild(plusmn);
      plusmn.innerHTML = "&plusmn;";
      if (1n !== ret[1]) plusmn.textContent += ret[1];
      plusmn.innerHTML += "&radic;";
      first.appendChild(element({
        tag: "span",
        style: {
          textDecorationLine: "overline"
        },
        children: [`${ret[2]}`]
      }));
      return element({
        tag: "div",
        style: {
          display: "inline-block"
        },
        children: (1n !== ret[3]) ? [first, element({
          tag: "div",
          style: {
            textAlign: "center",
            borderTop: "1px solid #fff"
          },
          children: [`${ret[3]}`]
        })] : [first]
      });
    }
  }
};

~function() {
  const a = element({ tag: "input" });
  const b = element({ tag: "input" });
  const c = element({ tag: "input" });
  a.type = b.type = c.type = "text";
  a.size = b.size = c.size = 5;
  const ans = element({
    tag: "div",
    style: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      padding: "6px 0px"
    }
  });
  const loadingText = document.createElement("div");
  loadingText.style.display = "none";
  [..."loading..."].forEach((c, i) => {
    const e = document.createElement('span');
    e.textContent = c;
    e.style.display = "inline-block";
    e.style.animation = `wave-text 1.5s ease-in-out ${Math.floor(i * 1000 / 13) / 1000}s infinite`;
    loadingText.appendChild(e);
  });
  let q = Promise.resolve();
  const update = () => void (q = q.then(async () => {
    ans.textContent = "";
    loadingText.style.display = "";
    try {
      if (isWithPrefix(a.value)) a.value = a.value.slice(1);
      if (isWithPrefix(b.value)) b.value = b.value.slice(1);
      if (isWithPrefix(c.value)) c.value = c.value.slice(1);
      const res = await solveQuadratic(a.value, b.value, c.value);
      ans.append(element({
        tag: "span",
        style: { whiteSpace: "pre" },
        children: ["x = "]
      }), element({
        tag: "div",
        children: [ resultToHTML(res) ]
      }));
    } catch(err) {
      ans.appendChild(element({
        tag: "div",
        style: { display: "inline-block" },
        children: [`${err}`]
      }));
    }
    loadingText.style.display = "none";
  }));
  a.addEventListener("input", update);
  b.addEventListener("input", update);
  c.addEventListener("input", update);
  document.body.append(element({
    tag: "div",
    children: [
      a,
      element({
        tag: "span",
        style: { whiteSpace: "pre" },
        children: ["x^2 + "]
      }),
      b,
      element({
        tag: "span",
        style: { whiteSpace: "pre" },
        children: ["x + "]
      }),
      c,
      element({
        tag: "span",
        style: { whiteSpace: "pre" },
        children: [" = 0"]
      }),
      element({ tag: "br" }),
      ans
    ]
  }), loadingText);
}();
