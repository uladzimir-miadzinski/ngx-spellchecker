CKEDITOR.plugins.add('spellchecker', {
  init(editor) {
    
    editor.ui.addButton('Spellchecker', {
      label: 'Spellcheck is Active',
      toolbar: 'insert'
    });
    
    if (editor.contextMenu) {
      editor.contextMenu.addListener((element, selection) => {
        
        const genSpellfixCommand = (word, currentSelection) => ({
          exec: function(ckeInstance) {
            ckeInstance.container.$.innerHTML = ckeInstance.container.$.innerHTML.replace(currentSelection.getStartElement().$.outerHTML, word);
          }
        });
        
        const suggestions = (element.$.dataset.suggest || '').split(',');
        
        editor.addMenuGroup('suggestions');
        
        //this.path
        const menuItemsCollection = suggestions.map(suggestion => {
          const commandName = `spellcheck_${suggestion}`;
          
          editor.addCommand(commandName, genSpellfixCommand(suggestion, selection));
          
          return {
            label: suggestion,
            icon: '',
            command: commandName,
            group: 'suggestions',
            order: 1
          };
        });
        
        if (menuItemsCollection.length && menuItemsCollection[0].label === '') {
          return;
        }
        
        const menuItems = menuItemsCollection.reduce((acc, item) => ({...acc, [item.label]: item}), {});
        const tristateMenuItems = menuItemsCollection.reduce((acc, item) => ({
          ...acc,
          [item.label]: CKEDITOR.TRISTATE_OFF
        }), {});
        const submenu = {
          suggestions: {
            label: 'Change to ...',
            icon: 'https://cdn4.iconfinder.com/data/icons/materia-flat-basic-vol-2/24/009_095_spellcheck_letter_complete_alphabet-512.png',
            group: 'suggestions',
            getItems() {
              return tristateMenuItems;
            }
          },
          ...menuItems
        };
        
        editor.addMenuItems(submenu);
        
        return {
          suggestions: CKEDITOR.TRISTATE_OFF
        };
      });
      
      
    }
  }
});
