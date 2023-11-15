<template>
  <vxe-grid ref="xGrid2" v-bind="gridOptions" />
</template>

<script lang="ts">
  import { defineComponent, reactive, ref, onUnmounted, nextTick } from 'vue';
  import { VXETable, VxeGridInstance, VxeGridProps } from 'vxe-table';
  import Sortable from 'sortablejs';
  import { cloneDeep } from 'lodash-es';

  export default defineComponent({
    setup() {
      const xGrid2 = ref({} as VxeGridInstance);
      const columns: any = [
        {
          field: 'basic',
          title: ' 基本信息',
          children: [{ field: 'name', title: 'Name', width: 300 }],
        },
        {
          field: 'more',
          fixed: 'left',
          title: ' 更多信息',
          children: [
            { field: 'sex', title: 'Sex' },
            { field: 'nickname', title: 'Nickname' },
            { field: 'role', title: 'Role' },
          ],
        },
        {
          field: 'classify',
          title: ' 分类信息',
          children: [
            { field: 'age', title: 'Age' },
            { field: 'date3', title: 'Date' },
            {
              field: 'address',
              title: 'Address',
            },
          ],
        },
      ];
      const data: any = [
        {
          id: 10001,
          name: 'Test1',
          nickname: 'T1',
          role: 'Develop',
          sex: 'Man',
          age: 28,
          address: 'Shenzhen',
          date3: '2022',
        },
        {
          id: 10002,
          name: 'Test2',
          nickname: 'T2',
          role: 'Test',
          sex: 'Women',
          age: 22,
          address: 'Guangzhou',
          date3: '2022',
        },
        {
          id: 10003,
          name: 'Test3',
          nickname: 'T3',
          role: 'PM',
          sex: 'Man',
          age: 32,
          address: 'Shanghai',
          date3: '2022',
        },
        {
          id: 10004,
          name: 'Test4',
          nickname: 'T4',
          role: 'Designer',
          sex: 'Women',
          age: 23,
          address: 'Shenzhen',
          date3: '2022',
        },
        {
          id: 10005,
          name: 'Test5',
          nickname: 'T5',
          role: 'Develop',
          sex: 'Women',
          age: 30,
          address: 'Shanghai',
          date3: '2022',
        },
      ];
      const gridOptions = reactive({
        border: true,
        showFooter: false,
        class: 'sortable-column-demo',
        columnConfig: {
          useKey: false,
        },
        scrollX: {
          enabled: false,
        },
        toolbarConfig: {
          custom: true,
        },
        columns,
        data,
      } as VxeGridProps);

      let sortable1: any;
      let sortable2: any;

      // 一级表头拖拽
      const columnDrop = () => {
        const $grid = xGrid2.value;
        const thDomList = $grid.$el.querySelectorAll(
          '.vxe-table--header-wrapper>.vxe-table--header .vxe-header--row',
        );
        if (thDomList.length <= 0) return;
        sortable1 = Sortable.create(thDomList[0], {
          handle: '.vxe-header--column',
          // filter: '.col--fixed',
          onEnd: (sortableEvent) => {
            const newIndex = sortableEvent.newIndex as number;
            const oldIndex = sortableEvent.oldIndex as number;
            const { collectColumn } = $grid.getTableColumn();

            const dragCell = cloneDeep(collectColumn[oldIndex]);
            const replaceCell = cloneDeep(collectColumn[newIndex]);

            const targetElem = sortableEvent.item;
            const wrapperElem = targetElem.parentNode as HTMLElement;
            const oldThElem = wrapperElem.children[oldIndex] as HTMLElement;

            // 目标位置元素被固定
            if (replaceCell.fixed) {
              if (newIndex > oldIndex) {
                wrapperElem.insertBefore(targetElem, oldThElem);
              } else {
                wrapperElem.insertBefore(
                  targetElem,
                  oldThElem ? oldThElem.nextElementSibling : oldThElem,
                );
              }
              VXETable.modal.message({ content: '固定列不允许拖动！', status: 'error' });
              return;
            }

            // 拖动位置元素被固定
            if (dragCell.fixed) {
              if (newIndex > oldIndex) {
                wrapperElem.insertBefore(targetElem, oldThElem);
              } else {
                wrapperElem.insertBefore(
                  oldThElem,
                  targetElem ? targetElem.nextElementSibling : targetElem,
                );
              }
              VXETable.modal.message({ content: '固定列不允许拖动！', status: 'error' });
              return;
            }

            // 元素替换
            collectColumn[oldIndex] = replaceCell;
            collectColumn[newIndex] = dragCell;
            $grid.loadColumn(collectColumn);
          },
        });
      };

      // 二级表头拖拽
      const columnDrop2 = () => {
        const $grid = xGrid2.value;
        const thDomList = $grid.$el.querySelectorAll(
          '.vxe-table--header-wrapper>.vxe-table--header .vxe-header--row',
        );
        if (thDomList.length < 2) return;
        sortable2 = Sortable.create(thDomList[1], {
          handle: '.vxe-header--column',
          onEnd: (sortableEvent) => {
            const newIndex = sortableEvent.newIndex as number;
            const oldIndex = sortableEvent.oldIndex as number;
            const { collectColumn, fullColumn } = $grid.getTableColumn();

            const targetElem = sortableEvent.item;
            const wrapperElem = targetElem.parentNode as HTMLElement;
            const oldThElem = wrapperElem.children[oldIndex] as HTMLElement;

            // 目标位置元素被固定
            if (fullColumn[oldIndex].field === '') {
              if (newIndex > oldIndex) {
                wrapperElem.insertBefore(targetElem, oldThElem);
              } else {
                wrapperElem.insertBefore(
                  targetElem,
                  oldThElem ? oldThElem.nextElementSibling : oldThElem,
                );
              }
              VXETable.modal.message({ content: '空列不允许拖动！', status: 'error' });
              return;
            }

            // 补丁：表头单元格切换-解决表头位置不更新的问题
            if (newIndex > oldIndex) {
              wrapperElem.insertBefore(targetElem, oldThElem);
            } else {
              wrapperElem.insertBefore(
                targetElem,
                oldThElem ? oldThElem.nextElementSibling : oldThElem,
              );
            }

            const groupGap = collectColumn.map((item) => item.children.length);
            const targetCellPosition = findCellPosition(groupGap, newIndex);
            const oldCellPosition = findCellPosition(groupGap, oldIndex);
            if (!targetCellPosition || !oldCellPosition) return;

            /**
             * 同一父级
             */
            if (oldCellPosition.parentIndex === targetCellPosition.parentIndex) {
              const parent = collectColumn[targetCellPosition.parentIndex];
              const target_child = parent.children[targetCellPosition.childIndex];
              const old_child = parent.children[oldCellPosition.childIndex];

              parent.children[oldCellPosition.childIndex] = target_child;
              parent.children[targetCellPosition.childIndex] = old_child;
            } else {
              /**
               * 跨父级
               */

              // 目标位置元素被固定
              if (fullColumn[newIndex].fixed) {
                if (newIndex > oldIndex) {
                  wrapperElem.insertBefore(targetElem, oldThElem);
                } else {
                  wrapperElem.insertBefore(
                    targetElem,
                    oldThElem ? oldThElem.nextElementSibling : oldThElem,
                  );
                }
                VXETable.modal.message({ content: '固定列不允许拖动！', status: 'error' });
                return;
              }

              // 拖动位置元素被固定
              if (fullColumn[oldIndex].fixed) {
                if (newIndex > oldIndex) {
                  wrapperElem.insertBefore(targetElem, oldThElem);
                } else {
                  wrapperElem.insertBefore(
                    oldThElem,
                    targetElem ? targetElem.nextElementSibling : targetElem,
                  );
                }
                VXETable.modal.message({ content: '固定列不允许拖动！', status: 'error' });
                return;
              }

              const target_parent = collectColumn[targetCellPosition.parentIndex];
              const old_parent = collectColumn[oldCellPosition.parentIndex];
              const old_child = old_parent.children[oldCellPosition.childIndex];

              if (target_parent.children.length === 1 && target_parent.children[0].field === '') {
                target_parent.children.splice(0, 1);
              }

              const insertIndex = targetCellPosition.childIndex;

              target_parent.children.splice(insertIndex, 0, old_child);
              old_parent.children.splice(oldCellPosition.childIndex, 1);

              if (old_parent.children.length <= 0) {
                const cloneChild = cloneDeep(old_child);
                cloneChild.id = `col_${new Date().getTime()}`;
                cloneChild.field = '';
                cloneChild.title = '';
                old_parent.children.push(cloneChild);
              }

              collectColumn[targetCellPosition.parentIndex] = target_parent;
              collectColumn[oldCellPosition.parentIndex] = old_parent;
            }

            $grid.loadColumn(collectColumn);
          },
        });
      };

      const findCellPosition = (groupGap, index) => {
        let sum = 0;
        for (let i = 0; i < groupGap.length; i++) {
          sum += groupGap[i];
          if (sum > index) {
            return {
              parentIndex: i,
              childIndex: groupGap[i] - (sum - index),
            };
          }
        }
        return null;
      };

      const sortFixedColumns = (cur_columns) => {
        const result: any = [];
        let leftLength = 0;
        let rightLength = 0;
        cur_columns.forEach((item: any) => {
          if (item.fixed === 'left') {
            leftLength++;
            result.unshift(item);
          } else if (item.fixed === 'right') {
            rightLength++;
            result.push(item);
          } else {
            // 过滤 fixed = ''
            if (item['fixed'] != undefined) {
              delete item.fixed;
            }
            result.splice(leftLength, 0, item);
          }
        });
        return result;
      };

      // 由于固定列在非头部或者尾部会产生bug，这里重新排序
      const washColumn = () => {
        const cur_columns = gridOptions.columns;
        const new_columns = sortFixedColumns(cur_columns);
        gridOptions.columns = new_columns;
      };

      let initTime: any;

      washColumn();

      nextTick(() => {
        initTime = setTimeout(() => {
          columnDrop();
          columnDrop2();
        }, 500);
      });

      onUnmounted(() => {
        clearTimeout(initTime);
        if (sortable2) {
          sortable2.destroy();
        }
        if (sortable1) {
          sortable1.destroy();
        }
      });

      return {
        xGrid2,
        gridOptions,
        columnDrop,
        columnDrop2,
      };
    },
  });
</script>

<style>
  .sortable-column-demo .vxe-header--row .vxe-header--column.sortable-ghost,
  .sortable-column-demo .vxe-header--row .vxe-header--column.sortable-chosen {
    background-color: #dfecfb;
  }

  .sortable-column-demo .vxe-header--row .vxe-header--column.col--fixed {
    cursor: no-drop;
  }
</style>
