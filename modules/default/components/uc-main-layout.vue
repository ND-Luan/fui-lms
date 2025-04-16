<template>
	<div>
		<div id="svg-tree"></div>
	</div>
</template>
<script>
	export default {
	
	    data() {
	        return {
	            tree: null
	        }
	    },
	    mounted() {
	        this.buildTree()
	    },
	    methods: {
	        
	        buildTree() {
	            const data = {
	                id: 'ms',
	                data: {
	                    imageURL: 'https://i.pravatar.cc/300?img=68',
	                    name: 'LHBS',
	                },
	                options: {
	                    nodeBGColor: '#cdb4db',
	                    nodeBGColorHover: '#cdb4db',
	                },
	                children: [
	                    {
	                        id: 'cap-1',
	                        data: {
	                            imageURL: 'https://i.pravatar.cc/300?img=69',
	                            name: 'Cấp 1',
	                        },
	                        options: {
	                            nodeBGColor: '#ffafcc',
	                            nodeBGColorHover: '#ffafcc',
	                        },
	                        children: [...Array(5)].map((_, index) => {
	                            const number = index + 1
	                            return {
	                                id: index,
	                                data: {
	                                    imageURL: 'https://i.pravatar.cc/300?img=6' + index,
	                                    name: 'Lớp ' + number,
	                                    lop: number
	                                },
	                                options: {
	                                    nodeBGColor: '#f8ad9d',
	                                    nodeBGColorHover: '#f8ad9d',
	                                },
	                            }
	                        })
	                    },
	                    {
	                        id: 'cap-2',
	                        data: {
	                            imageURL: 'https://i.pravatar.cc/300?img=59',
	                            name: 'Cấp 2',
	                        },
	                        options: {
	                            nodeBGColor: '#00afb9',
	                            nodeBGColorHover: '#00afb9',
	                        },
	                        children: [...Array(4)].map((_, index) => {
	                            const number = (index + 1) + 5
	                            return {
	                                id: index,
	                                data: {
	                                    imageURL: 'https://i.pravatar.cc/300?img=6' + index,
	                                    name: 'Lớp ' + number,
	                                    lop: number
	                                },
	                                options: {
	                                    nodeBGColor: '#f8ad9d',
	                                    nodeBGColorHover: '#f8ad9d',
	                                },
	                            }
	                        })
	                    },
	                    {
	                        id: 'cap-3',
	                        data: {
	                            imageURL: 'https://i.pravatar.cc/300?img=59',
	                            name: 'Cấp 3',
	                        },
	                        options: {
	                            nodeBGColor: '#00afb9',
	                            nodeBGColorHover: '#00afb9',
	                        },
	                        children: [...Array(3)].map((_, index) => {
	                            const number = (index + 1) + 9
	                            return {
	                                id: index,
	                                data: {
	                                    imageURL: 'https://i.pravatar.cc/300?img=6' + index,
	                                    name: 'Lớp ' + number,
	                                    lop: number
	                                },
	                                options: {
	                                    nodeBGColor: '#f8ad9d',
	                                    nodeBGColorHover: '#f8ad9d',
	                                },
	                            }
	                        })
	                    },
	                ],
	            };
	            const options = {
	                contentKey: 'data',
	                width: '100%',
	                height: 600,
	                nodeWidth: 150,
	                nodeHeight: 100,
	                fontColor: '#fff',
	                borderColor: '#333',
	                childrenSpacing: 50,
	                siblingSpacing: 20,
	                direction: 'top',
	                enableExpandCollapse: true,
	                nodeTemplate: (content) =>
	                    `<div 
	                        style='display: flex;flex-direction: column;gap: 10px;justify-content: center;align-items: center;height: 100%;'
	                        onclick='fn_x(${JSON.stringify(content)})'
	                    >
	                        <div style="font-weight: bold; font-family: Arial; font-size: 14px">${content.name}</div>
	                    </div>`,
	                canvasStyle: 'border: 1px solid black;background: #f6f6f6;',
	                enableToolbar: true,
	            };
	            const tree = new ApexTree(document.getElementById('svg-tree'), options);
	            tree.render(data);
	        }
	
	    }
	}
</script>