function makeNewFolder(FolderName){
    let NewFolder = "NewFolder";
    for (let i = 1; i < 1000; i++) {
       

     if(FolderName ===""){
            
            console.log("NewFolder")
            return NewFolder;
            
      }else if(FolderName==="NewFolder"){
            
            console.log("NewFolder(1)")
            return NewFolder;
            
      }else if(FolderName==="NewFolder"+"("+ i +")"){
            
            console.log(NewFolder+"("+ ++i +")")
            
        };
    }
}