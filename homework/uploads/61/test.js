function makeNewFolder(FolderName){
    let NewFolder = "NewFolder";
    for (let i = 1; i < 1000; i++) {
      if(FolderName ===""){
        return NewFolder;
      }else if(FolderName==="NewFolder"){
        return NewFolder;
      }else if(FolderName==="NewFolder"+"("+ i +")"){
        return NewFolder+"("+ ++i +")";
      };
    }
}