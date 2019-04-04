CKEDITOR.plugins.add('spellchecker', {
  init(editor) {
    
    editor.addCommand('spellcheck', {
      exec: function (editor) {
        alert('myCommand');
      }
    });
    
    editor.ui.addButton('Spellchecker', {
      label: 'Spellcheck is Active',
      toolbar: 'insert'
    });
    
    if (editor.contextMenu) {
      /* editor.addMenuGroup('spellcheckerGroup');
       editor.addMenuItem('spellcheckerItem', {
         order: 0,
         label: 'Edit Spellchecker',
         icon: this.path + 'icons/spellchecker.png',
         command: 'spellchecker',
         group: 'spellcheckerGroup'
       });*/
      
      editor.contextMenu.addListener((element, selection) => {
        const suggestions = (element.$.dataset.suggest || '').split(',');
        console.log(selection);
        editor.addMenuGroup('suggestions');
        //this.path
        const menuItemsCollection = suggestions.map(suggestion => ({
          label: suggestion,
          icon: 'https://cdn4.iconfinder.com/data/icons/materia-flat-basic-vol-2/24/009_095_spellcheck_letter_complete_alphabet-512.png',
          command: 'spellcheck',
          group: 'suggestions',
          order: 1
        }));
        
        if (menuItemsCollection.length && menuItemsCollection[0].label === '') {
          return;
        }
        
        const menuItems = menuItemsCollection.reduce((acc, item) => ({...acc, [item.label]: item}), {});
        console.log(menuItems);
        editor.addMenuItems(menuItems);
  
        return menuItemsCollection.reduce((acc, item) => ({...acc, [item.label]: CKEDITOR.TRISTATE_OFF}), {});
      });
      
      
    }
  }
});
