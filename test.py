import os
from sqlalchemy_schemadisplay import create_schema_graph
from sqlalchemy import MetaData
from extensions import db

def generate_er_diagram(output_file='er_diagram.png'):
    # Reflect the metadata from the SQLAlchemy database
    metadata = MetaData()
    metadata.reflect(bind=db.engine)

    # Generate ER diagram from the reflected metadata
    graph = create_schema_graph(
        metadata=metadata,
        show_datatypes=True,  # Show column datatypes
        show_indexes=True,  # Show index info on the schema
        rankdir='LR',  # Layout direction - left to right
        concentrate=False  # Do not merge multiple edges
    )
    
    # Save the ER diagram to a file
    graph.write_png(output_file)
    print(f"ER diagram generated and saved to {output_file}")

if __name__ == "__main__":
    # Make sure the output directory exists
    output_directory = "output"
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    # Generate and save the ER diagram to the output directory
    output_path = os.path.join(output_directory, "er_diagram.png")
    generate_er_diagram(output_path)
