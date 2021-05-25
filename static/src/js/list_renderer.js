/**
 By Supriya: Editable Field on List view
 Applicable only for tree view.
 Need to add on any field in xml as
 <field name="user_id" widget="many2one" attrs="{'editable': 1}"/>
 Widget will be based on field type,If field type is Char then widget must be 'char'.
 */

odoo.define('editable_field_on_tree_view.ListRenderer', function (require) {
    "use strict";


    const ListRenderer = require('web.ListRenderer');

    const FIELD_CLASSES = {
        char: 'o_list_char',
        float: 'o_list_number',
        integer: 'o_list_number',
        monetary: 'o_list_number',
        text: 'o_list_text',
        many2one: 'o_list_many2one',
    };



ListRenderer.include({

    /**
         * @override
     */
    _renderBodyCell: function (record, node, colIndex, options) {
        let isEditableField = node.attrs.modifiers && node.attrs.modifiers.editable || false;
        if (isEditableField && this.getParent() && !this.getParent().action) {
            var tdClassName = 'o_data_cell';
            if (node.tag === 'button_group') {
                tdClassName += ' o_list_button';
            } else if (node.tag === 'field') {
                tdClassName += ' o_field_cell';
                var typeClass = FIELD_CLASSES[this.state.fields[node.attrs.name].type];
                if (typeClass) {
                    tdClassName += (' ' + typeClass);
                }
                if (node.attrs.widget) {
                    tdClassName += (' o_' + node.attrs.widget + '_cell');
                }
            }
            if (node.attrs.editOnly) {
                tdClassName += ' oe_edit_only';
            }
            if (node.attrs.readOnly) {
                tdClassName += ' oe_read_only';
            }
            var $td = $('<td>', {class: tdClassName});

            // We register modifiers on the <td> element so that it gets the correct
            // modifiers classes (for styling)
            var modifiers = this._registerModifiers(node, record, $td, 'edit');
            // If the invisible modifiers is true, the <td> element is left empty.
            // Indeed, if the modifiers was to change the whole cell would be
            // rerendered anyway.
            if (modifiers.invisible && !(options && options.renderInvisible)) {
                return $td;
            }
            if (node.tag === 'button_group') {
                for (const buttonNode of node.children) {
                    if (!this.columnInvisibleFields[buttonNode.attrs.name]) {
                        $td.append(this._renderButton(record, buttonNode));
                    }
                }
                return $td;
            } else if (node.tag === 'widget') {
                return $td.append(this._renderWidget(record, node));
            }
            if (node.attrs.widget || (options && options.renderWidgets)) {
                var _mode = this.mode;
                this.mode = 'edit';
                var widget = this._renderFieldWidget(node, record, 'edit');
                this.mode = _mode;
                this._handleAttributes(widget, node);
                $td.on('click', (ev) => {
                    ev.stopPropagation();
                });
                return $td.append(widget);
            }

            this._setDecorationClasses($td, this.fieldDecorations[node.attrs.name], record);
            var name = node.attrs.name;
            var field = this.state.fields[name];
            var value = record.data[name];
            var formatter = field_utils.format[field.type];
            var formatOptions = {
                escape: true,
                data: record.data,
                isPassword: 'password' in node.attrs,
                digits: node.attrs.digits && JSON.parse(node.attrs.digits),
            };
            var formattedValue = formatter(value, field, formatOptions);
            var title = '';
            if (field.type !== 'boolean') {
                title = formatter(value, field, _.extend(formatOptions, {escape: false}));
            }
            return $td.html(formattedValue).attr('title', title);
        } else {
            return this._super.apply(this, arguments);
        }
    },

});

});
