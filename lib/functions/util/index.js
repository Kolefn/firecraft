

module.exports.extractPathParams = (string="") => {
  let params = {};
  let param = "";
  let reading = false;
  for(let c of string){
    if(c == '{'){ param = ""; reading = true; }
    else if(c == '}'){ params[param] = true; reading = false; }
    else if(c == '/'){ continue; }
    else if(reading) { param += c; }
  }

  return params;
}
