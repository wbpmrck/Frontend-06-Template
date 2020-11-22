/**
 * 支持在pattern中带?号的kmp算法（TODO:未完成）
 * @date 2020-11-22
 * @param {any} source
 * @param {any} pattern
 * @returns {any}
 */
function kmp(source,pattern){
  //计算跳转表
  let table = new Array(pattern.length).fill(0);
  {
    let i = 1,j = 0;

    while(i < pattern.length) {
      //匹配上的情况，说明有自重复
      if(pattern[i] === pattern[j]){
        ++j, ++i;
        table[i] = j; //记录位置i的重复数
      }else{
        if(j > 0)
          j = table[j];
        else{
          ++i;
        }
      }
    }
  }


  console.log(table);

  //匹配
  {
    let i = 0, j = 0;
    while(i < source.length){
      if(pattern[j] === source[i]){
        ++i,++j;
      }else {
        if(j > 0)
          j = table[j]
        else
          ++i;
      }

      if(j === pattern.length){
        return true;
      }
    }
    return false;
  }
}

console.log(kmp("abc","abc"));
console.log(kmp("abcdabceaac","abce"));
console.log(kmp("aabaadaaac","aaac"));